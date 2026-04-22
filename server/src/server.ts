import express, { Response, Request } from "express"
import dotenv from "dotenv"
import http from "http"
import cors from "cors"
import mongoose from "mongoose"
import { Room } from "./models/Room"
import { SocketEvent, SocketId } from "./types/socket"
import { USER_CONNECTION_STATUS, User } from "./types/user"
import { Server } from "socket.io"
import path from "path"
import https from "https"
import { v4 as uuidv4 } from "uuid"

dotenv.config()

const app = express()

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/codenest"
mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("MongoDB connection error:", err))

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, "public")))

// New AI Chat Route (OpenRouter Integration with Streaming)
app.post("/api/ai/chat", async (req: Request, res: Response) => {
	const { prompt, roomId } = req.body
	const apiKey = process.env.GEMINI_API_KEY
    
	console.log(`AI Request for Room ${roomId}: ${prompt.substring(0, 20)}...`)

	if (!apiKey) return res.status(500).json({ error: "Missing API Key" })

	// Set headers for streaming
	res.setHeader("Content-Type", "text/event-stream")
	res.setHeader("Cache-Control", "no-cache, no-transform")
	res.setHeader("Connection", "keep-alive")
    res.write(" ") // Initial chunk

	const data = JSON.stringify({
		model: "openrouter/free", 
		messages: [
			{ role: "system", content: "You are CodeNest AI." },
			{ role: "user", content: prompt }
		],
		stream: true
	})

	const options = {
		hostname: "openrouter.ai",
		path: "/api/v1/chat/completions",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${apiKey}`,
		},
		timeout: 15000
	}

	let fullAIResponse = ""
	const apiReq = https.request(options, (apiRes) => {
		let buffer = ""
		apiRes.on("data", (chunk) => {
            const chunkStr = chunk.toString()
			buffer += chunkStr
			const lines = buffer.split("\n")
			buffer = lines.pop() || ""

			for (const line of lines) {
				const trimmedLine = line.trim()
				if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue

				const dataStr = trimmedLine.replace("data: ", "").trim()
				if (dataStr === "[DONE]") {
                    // Save conversation to DB when stream ends
                    if (roomId) {
                        Room.findOneAndUpdate({ roomId }, { 
                            $push: { 
                                copilotChats: [
                                    { id: uuidv4(), username: "User", message: prompt, timestamp: new Date().toISOString() },
                                    { id: uuidv4(), username: "AI", message: fullAIResponse, timestamp: new Date().toISOString() }
                                ] 
                            } 
                        }).exec()
                    }
					res.end()
					return
				}

				try {
					const json = JSON.parse(dataStr)
					const content = json.choices?.[0]?.delta?.content
					if (content) {
                        fullAIResponse += content
						res.write(content)
					}
				} catch (e) {}
			}
		})
	})

	apiReq.on("error", (err) => {
		res.write(`Error: AI Connection Failed.`)
		res.end()
	})

	apiReq.write(data)
	apiReq.end()
})


app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", time: new Date().toISOString() })
})

app.get("/", (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "*",
	},
	maxHttpBufferSize: 1e8,
	pingTimeout: 60000,
})

let userSocketMap: User[] = []

// Function to get all users in a room
function getUsersInRoom(roomId: string): User[] {
	return userSocketMap.filter((user) => user.roomId == roomId)
}

// Function to get room id by socket id
function getRoomId(socketId: SocketId): string | null {
	const roomId = userSocketMap.find(
		(user) => user.socketId === socketId
	)?.roomId

	if (!roomId) {
		console.error("Room ID is undefined for socket ID:", socketId)
		return null
	}
	return roomId
}

function getUserBySocketId(socketId: SocketId): User | null {
	const user = userSocketMap.find((user) => user.socketId === socketId)
	if (!user) {
		console.error("User not found for socket ID:", socketId)
		return null
	}
	return user
}

io.on("connection", (socket) => {
	// Handle user actions
	socket.on(SocketEvent.JOIN_REQUEST, async ({ roomId, username }) => {
		// Check is username exist in the room
		const isUsernameExist = getUsersInRoom(roomId).filter(
			(u) => u.username === username
		)
		if (isUsernameExist.length > 0) {
			io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS)
			return
		}

		// Hydrate State from MongoDB
		let roomData = await Room.findOne({ roomId })
		
		if (!roomData) {
			roomData = await Room.create({
				roomId,
				fileStructure: {
					id: uuidv4(),
					name: "root",
					type: "directory",
					children: [
						{
							id: uuidv4(),
							type: "file",
							name: "index.js",
							content: "console.log('Welcome to CodeNest');",
						},
					],
				},
				chats: [],
				copilotChats: []
			})
		}

		const user = {
			username,
			roomId,
			status: USER_CONNECTION_STATUS.ONLINE,
			cursorPosition: 0,
			typing: false,
			socketId: socket.id,
			currentFile: null,
		}
		userSocketMap.push(user)
		socket.join(roomId)
		socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user })
		const users = getUsersInRoom(roomId)
		
		io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { 
			user, 
			users,
			initialState: {
				fileStructure: roomData.fileStructure,
				chats: roomData.chats,
				copilotChats: roomData.copilotChats,
				drawingData: roomData.drawingData
			}
		})
	})

	socket.on("disconnecting", () => {
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.USER_DISCONNECTED, { user })
		userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id)
		socket.leave(roomId)
	})

	// Handle file actions
	socket.on(
		SocketEvent.SYNC_FILE_STRUCTURE,
		async ({ fileStructure, openFiles, activeFile, socketId }) => {
			io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
				fileStructure,
				openFiles,
				activeFile,
			})
			
			// Auto-Save to MongoDB
			const roomId = getRoomId(socket.id)
			if (roomId) {
				await Room.findOneAndUpdate({ roomId }, { fileStructure })
			}
		}
	)

	socket.on(
		SocketEvent.DIRECTORY_CREATED,
		({ parentDirId, newDirectory }) => {
			const roomId = getRoomId(socket.id)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, {
				parentDirId,
				newDirectory,
			})
		}
	)

	socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, {
			dirId,
			children,
		})
	})

	socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, {
			dirId,
			newName,
		})
	})

	socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.DIRECTORY_DELETED, { dirId })
	})

	socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.FILE_CREATED, { parentDirId, newFile })
	})

	socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, {
			fileId,
			newContent,
		})
	})

	socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, {
			fileId,
			newName,
		})
	})

	socket.on(SocketEvent.FILE_DELETED, ({ fileId }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId })
	})

	// Handle user status
	socket.on(SocketEvent.USER_OFFLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: USER_CONNECTION_STATUS.OFFLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.USER_OFFLINE, { socketId })
	})

	socket.on(SocketEvent.USER_ONLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: USER_CONNECTION_STATUS.ONLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.USER_ONLINE, { socketId })
	})

	// Handle chat actions
	socket.on(SocketEvent.SEND_MESSAGE, async ({ message }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.RECEIVE_MESSAGE, { message })
		
		// Auto-Save Chat to MongoDB
		await Room.findOneAndUpdate({ roomId }, { $push: { chats: message } })
	})

	// Handle cursor position and selection
	socket.on(SocketEvent.TYPING_START, ({ cursorPosition, selectionStart, selectionEnd }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return {
					...user,
					typing: true,
					cursorPosition,
					selectionStart,
					selectionEnd
				}
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.TYPING_START, { user })
	})

	socket.on(SocketEvent.TYPING_PAUSE, () => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: false }
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.TYPING_PAUSE, { user })
	})

	// Handle cursor movement without typing
	socket.on(SocketEvent.CURSOR_MOVE, ({ cursorPosition, selectionStart, selectionEnd }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return {
					...user,
					cursorPosition,
					selectionStart,
					selectionEnd
				}
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.CURSOR_MOVE, { user })
	})

	socket.on(SocketEvent.REQUEST_DRAWING, () => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id })
	})

	socket.on(SocketEvent.SYNC_DRAWING, async ({ drawingData, socketId }) => {
		socket.broadcast
			.to(socketId)
			.emit(SocketEvent.SYNC_DRAWING, { drawingData })
		
		// Auto-Save Drawing to MongoDB
		const roomId = getRoomId(socket.id)
		if (roomId) {
			await Room.findOneAndUpdate({ roomId }, { drawingData })
		}
	})

	socket.on(SocketEvent.DRAWING_UPDATE, async ({ snapshot }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, {
			snapshot,
		})

		// Auto-Save Drawing Snapshot to MongoDB
		await Room.findOneAndUpdate({ roomId }, { drawingData: snapshot })
	})

	socket.on(SocketEvent.DELETE_ROOM, async () => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return

		try {
			// Delete from MongoDB
			await Room.findOneAndDelete({ roomId })
			
			// Broadcast deletion to all users in the room
			io.to(roomId).emit(SocketEvent.DELETE_ROOM)
			
			// Force disconnect and clean up
			const roomUsers = getUsersInRoom(roomId)
			roomUsers.forEach(u => {
				const s = io.sockets.sockets.get(u.socketId)
				if (s) s.leave(roomId)
			})
			
			userSocketMap = userSocketMap.filter(u => u.roomId !== roomId)
			console.log(`Room ${roomId} has been deleted and purged.`)
		} catch (error) {
			console.error("Error deleting room:", error)
		}
	})
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})

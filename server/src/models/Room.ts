import mongoose from "mongoose"

const ChatMessageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    message: { type: String, required: true },
    username: { type: String, required: true },
    timestamp: { type: String, required: true }
}, { _id: false })

const RoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    fileStructure: { type: mongoose.Schema.Types.Mixed, required: true },
    chats: [ChatMessageSchema], // Group Chat history
    copilotChats: [ChatMessageSchema], // AI interaction history
    drawingData: { type: mongoose.Schema.Types.Mixed, default: {} }
} as any, { timestamps: true })

export const Room = mongoose.model<any>("Room", RoomSchema)

import { ICopilotContext } from "@/types/copilot"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useParams } from "react-router-dom"
import { useSocket } from "./SocketContext"
import { SocketEvent } from "@/types/socket"

const CopilotContext = createContext<ICopilotContext | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useCopilot = () => {
    const context = useContext(CopilotContext)
    if (context === null) {
        throw new Error(
            "useCopilot must be used within a CopilotContextProvider",
        )
    }
    return context
}

export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

const CopilotContextProvider = ({ children }: { children: ReactNode }) => {
    const { roomId } = useParams()
    const { socket } = useSocket()
    const [input, setInput] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([])
    const [isRunning, setIsRunning] = useState<boolean>(false)

    // Hydrate AI history from MongoDB
    useEffect(() => {
        const handleJoinAccepted = ({ initialState }: { initialState?: any }) => {
            if (initialState?.copilotChats) {
                const hydratedMessages: Message[] = initialState.copilotChats.map((chat: any) => ({
                    id: chat.id,
                    role: chat.username === "AI" ? "assistant" : "user",
                    content: chat.message,
                    timestamp: new Date(chat.timestamp)
                }))
                setMessages(hydratedMessages)
            }
        }

        socket.on(SocketEvent.JOIN_ACCEPTED, handleJoinAccepted)
        return () => {
            socket.off(SocketEvent.JOIN_ACCEPTED, handleJoinAccepted)
        }
    }, [socket])

    const generateCode = async () => {
        try {
            if (!input.trim()) return

            const userMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content: input,
                timestamp: new Date()
            }

            const assistantId = (Date.now() + 1).toString()
            const initialAssistantMessage: Message = {
                id: assistantId,
                role: "assistant",
                content: "",
                timestamp: new Date()
            }

            setMessages(prev => [...prev, userMessage, initialAssistantMessage])
            setInput("") 
            setIsRunning(true)
            
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:3000"
            const response = await fetch(`${backendUrl}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    prompt: input,
                    roomId // Pass roomId for backend persistence
                })
            })

            if (!response.body) throw new Error("No response body")
            
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            
            while (true) {
                const { value, done } = await reader.read()
                if (done) break
                
                const chunkValue = decoder.decode(value, { stream: true })
                if (!chunkValue) continue

                setMessages(prev => prev.map(msg => 
                    msg.id === assistantId 
                        ? { ...msg, content: msg.content + chunkValue }
                        : msg
                ))
            }

            setIsRunning(false)
        } catch (error: any) {
            console.error("AI Error:", error)
            setIsRunning(false)
            toast.error(`AI Error: ${error.message || "Connection failed"}`)
        }
    }

    return (
        <CopilotContext.Provider
            value={{
                input,
                setInput,
                messages,
                isRunning,
                generateCode,
                setMessages,
            }}
        >
            {children}
        </CopilotContext.Provider>
    )
}

export { CopilotContextProvider }
export default CopilotContext

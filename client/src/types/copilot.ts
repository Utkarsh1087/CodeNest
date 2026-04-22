export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

export interface ICopilotContext {
    input: string
    setInput: (input: string) => void
    messages: Message[]
    isRunning: boolean
    generateCode: () => void
    setMessages: (messages: Message[]) => void
}

import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { SyntheticEvent, useEffect, useRef } from "react"

function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
    } = useChatRoom()
    const { currentUser } = useAppContext()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)

    const handleScroll = (e: SyntheticEvent) => {
        const container = e.target as HTMLDivElement
        setLastScrollHeight(container.scrollTop)
    }

    // Scroll to bottom when messages change
    useEffect(() => {
        if (!messagesContainerRef.current) return
        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false)
        }
        if (messagesContainerRef.current)
            messagesContainerRef.current.scrollTop = lastScrollHeight
    }, [isNewMessage, setIsNewMessage, lastScrollHeight])

    return (
        <div
            className="flex-grow overflow-auto p-4 custom-scrollbar flex flex-col gap-4"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {/* Chat messages */}
            {messages.map((message, index) => {
                const isMe = message.username === currentUser.username
                return (
                    <div
                        key={index}
                        className={`flex flex-col group transition-all duration-500 ${isMe ? "items-end" : "items-start"}`}
                    >
                        <div className={`flex items-center gap-2 mb-1.5 px-1 transition-opacity duration-500 ${isMe ? "flex-row-reverse" : ""}`}>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isMe ? "text-primary/80" : "text-white/30 group-hover:text-white/60"}`}>
                                {isMe ? "You" : message.username}
                            </span>
                            <span className="text-[9px] text-white/20 font-bold tracking-tighter">
                                {message.timestamp}
                            </span>
                        </div>
                        <div
                            className={`max-w-[88%] break-words rounded-2xl px-5 py-3 text-[13px] shadow-2xl transition-all duration-500 backdrop-blur-xl ${isMe
                                    ? "bg-gradient-to-br from-primary to-primary/80 text-black rounded-tr-none font-bold shadow-primary/10 scale-100 hover:scale-[1.02]"
                                    : "bg-white/[0.03] border border-white/10 text-white/90 rounded-tl-none hover:bg-white/[0.06] hover:border-white/20 scale-100 hover:scale-[1.02]"
                                }`}
                        >
                            <p className="leading-relaxed tracking-wide font-medium">{message.message}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ChatList

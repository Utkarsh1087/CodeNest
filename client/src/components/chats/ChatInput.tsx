import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useSocket } from "@/context/SocketContext"
import { ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { formatDate } from "@/utils/formateDate"
import { FormEvent, useRef } from "react"
import { LuSendHorizonal } from "react-icons/lu"
import { v4 as uuidV4 } from "uuid"

function ChatInput() {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const { setMessages } = useChatRoom()
    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const inputVal = inputRef.current?.value.trim()

        if (inputVal && inputVal.length > 0) {
            const message: ChatMessage = {
                id: uuidV4(),
                message: inputVal,
                username: currentUser.username,
                timestamp: formatDate(new Date().toISOString()),
            }
            socket.emit(SocketEvent.SEND_MESSAGE, { message })
            setMessages((messages) => [...messages, message])

            if (inputRef.current) inputRef.current.value = ""
        }
    }

    return (
        <form
            onSubmit={handleSendMessage}
            className="relative mt-4 group"
        >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-1 shadow-2xl transition-all focus-within:border-primary/30 focus-within:bg-white/[0.05] backdrop-blur-2xl">
                <input
                    type="text"
                    className="w-full bg-transparent py-3.5 pl-5 pr-14 text-[13px] font-medium text-white/90 outline-none placeholder:text-white/20 tracking-wide"
                    placeholder="Type a message..."
                    ref={inputRef}
                />
                <button
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-black transition-all hover:scale-110 active:scale-95 shadow-xl shadow-primary/20"
                    type="submit"
                    title="Send Message"
                >
                    <LuSendHorizonal size={18} />
                </button>
            </div>
        </form>
    )
}

export default ChatInput

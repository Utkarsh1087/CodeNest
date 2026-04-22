import { useCopilot, Message } from "@/context/CopilotContext"
import { useFileSystem } from "@/context/FileContext"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { SocketEvent } from "@/types/socket"
import { ACTIVITY_STATE } from "@/types/app"
import toast from "react-hot-toast"
import { LuClipboardPaste, LuCopy, LuRepeat, LuSparkles, LuSend, LuTrash2, LuUser } from "react-icons/lu"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import cn from "classnames"
import { useEffect, useRef } from "react"

function CopilotView() {
    const { socket } = useSocket()
    const { viewHeight } = useResponsive()
    const { generateCode, messages, isRunning, input, setInput, setMessages } = useCopilot()
    const { activeFile, updateFileContent, setActiveFile } = useFileSystem()
    const { setActivityState } = useAppContext()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isRunning])

    const copyCode = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success("Copied to clipboard")
        } catch (error) {
            toast.error("Failed to copy")
        }
    }

    const pasteCodeInFile = (text: string) => {
        if (!activeFile) {
            toast.error("Select a file first")
            return
        }
        const fileContent = activeFile.content ? `${activeFile.content}\n` : ""
        const content = `${fileContent}${text}`
        updateFileContent(activeFile.id, content)
        setActiveFile({ ...activeFile, content })
        setActivityState(ACTIVITY_STATE.CODING)
        socket.emit(SocketEvent.FILE_UPDATED, { fileId: activeFile.id, newContent: content })
        toast.success("Pasted successfully")
    }

    const replaceCodeInFile = (text: string) => {
        if (!activeFile) {
            toast.error("Select a file first")
            return
        }
        if (!window.confirm("Overwrite current file content?")) return
        updateFileContent(activeFile.id, text)
        setActiveFile({ ...activeFile, content: text })
        setActivityState(ACTIVITY_STATE.CODING)
        socket.emit(SocketEvent.FILE_UPDATED, { fileId: activeFile.id, newContent: text })
        toast.success("Code replaced")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            generateCode()
        }
    }

    return (
        <div 
            className="flex flex-col bg-transparent font-sans overflow-hidden relative h-full max-h-full" 
        >
            {/* Glass Header */}
            <div className="flex items-center justify-between pl-6 pr-10 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <LuSparkles className="text-primary relative z-10" size={16} />
                        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Copilot</span>
                        <span className="text-[8px] font-bold text-primary/60 tracking-tight">ONLINE • V2.0</span>
                    </div>
                </div>
                <button 
                    onClick={() => setMessages([])}
                    className="p-1.5 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"
                    title="Clear Chat"
                >
                    <LuTrash2 size={14} />
                </button>
            </div>

            {/* Chat History with increased bottom padding for floating input */}
            <div 
                ref={scrollRef}
                className="flex-grow overflow-y-auto custom-scrollbar pt-6 pb-40 pl-5 pr-9 flex flex-col gap-6"
            >
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6 opacity-40 group/empty">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                            <LuSparkles size={40} className="text-primary relative z-10 drop-shadow-[0_0_10px_rgba(57,224,121,0.3)] transition-transform duration-700 group-hover/empty:scale-110" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">CodeNest Copilot</h3>
                            <p className="text-[9px] font-medium text-white/30 tracking-widest uppercase leading-relaxed">
                                Ready to assist with code,<br/>logic, and documentation.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={cn(
                            "flex gap-4 max-w-[90%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        {/* Avatar Pill */}
                        <div className={cn(
                            "w-9 h-9 min-w-[36px] rounded-xl flex items-center justify-center transition-all duration-500",
                            msg.role === "user" 
                                ? "bg-white/[0.03] text-white/30 border border-white/10 group-hover:bg-white/[0.06] group-hover:text-white/60" 
                                : "bg-gradient-to-br from-primary to-primary/80 text-black shadow-[0_0_20px_rgba(57,224,121,0.2)] animate-pulse"
                        )}>
                            {msg.role === "user" ? <LuUser size={16} /> : <LuSparkles size={16} />}
                        </div>

                        {/* Content Bubble */}
                        <div className={cn(
                            "flex flex-col gap-2 relative group-hover:scale-[1.01] transition-transform duration-500",
                            msg.role === "user" ? "items-end" : "items-start"
                        )}>
                            <div className={cn(
                                "rounded-2xl px-5 py-3.5 text-[13.5px] leading-relaxed relative overflow-hidden",
                                msg.role === "user" 
                                    ? "bg-white/[0.02] text-white/80 border border-white/5 rounded-tr-none backdrop-blur-md" 
                                    : cn(
                                        "bg-gradient-to-br from-primary/[0.08] via-primary/[0.02] to-transparent text-white/95 border border-primary/20 rounded-tl-none shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl",
                                        !msg.content && "animate-pulse min-w-[50px] min-h-[40px]"
                                    )
                            )}>
                                {/* Refractive Highlight for AI */}
                                {msg.role === "assistant" && (
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent shadow-[0_0_10px_rgba(57,224,121,0.5)]" />
                                )}

                                <div className="markdown-content font-medium tracking-wide">
                                    {!msg.content && msg.role === "assistant" ? (
                                        <div className="flex gap-1.5 py-1 px-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"></span>
                                        </div>
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                code({ className, children, ...props }: any) {
                                                    const match = /language-(\w+)/.exec(className || "")
                                                    const language = match ? match[1] : ""
                                                    const codeStr = String(children).replace(/\n$/, "")
 
                                                    return match ? (
                                                        <div className="my-6 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d]/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] group/code relative">
                                                            <div className="flex items-center justify-between bg-white/[0.03] px-5 py-2.5 border-b border-white/5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex gap-1.5 mr-2">
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                                                                    </div>
                                                                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em]">{language || "code"}</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => copyCode(codeStr)}
                                                                        className="p-1.5 hover:bg-white/10 rounded-lg hover:text-primary transition-all text-white/20"
                                                                        title="Copy"
                                                                    >
                                                                        <LuCopy size={13} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => pasteCodeInFile(codeStr)}
                                                                        className="p-1.5 hover:bg-white/10 rounded-lg hover:text-primary transition-all text-white/20"
                                                                        title="Append to File"
                                                                    >
                                                                        <LuClipboardPaste size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language={language}
                                                                PreTag="div"
                                                                className="!m-0 !bg-transparent !p-5 !text-[12.5px] !leading-relaxed custom-scrollbar selection:bg-primary/30"
                                                            >
                                                                {codeStr}
                                                            </SyntaxHighlighter>
                                                        </div>
                                                    ) : (
                                                        <code className={cn("rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-primary/80", className)} {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading state is now handled by pulsing message bubble */}
            </div>

            {/* Floating Glass Input HUD */}
            <div className="absolute bottom-0 left-0 w-full pt-10 pb-4 pl-5 pr-9 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent">
                <div className="relative group rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-2 shadow-2xl transition-all focus-within:border-primary/30 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_40px_-15px_rgba(57,224,121,0.2)] shimmer-border">
                    <div className="flex items-end gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Copilot anything..."
                            className="flex-grow bg-transparent p-1.5 text-[13px] text-white/90 outline-none resize-none min-h-[38px] max-h-[180px] custom-scrollbar placeholder:text-white/20"
                            rows={1}
                        />
                        <button
                            onClick={generateCode}
                            disabled={isRunning || !input.trim()}
                            className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-primary text-black disabled:bg-white/10 disabled:text-white/10 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-primary/20"
                        >
                            <LuSend size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CopilotView

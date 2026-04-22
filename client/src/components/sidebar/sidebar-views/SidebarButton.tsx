import { useChatRoom } from "@/context/ChatContext"
import { useViews } from "@/context/ViewContext"
import { VIEWS } from "@/types/view"
import React, { useState } from "react"
import { Tooltip } from "react-tooltip"
import { tooltipStyles } from "../tooltipStyles"
import cn from "classnames"

interface ViewButtonProps {
    viewName: VIEWS
    icon: React.ReactNode
}

const ViewButton = ({ viewName, icon }: ViewButtonProps) => {
    const { activeView, setActiveView, isSidebarOpen, setIsSidebarOpen, isAIOpen, setIsAIOpen } = useViews()
    const { isNewMessage } = useChatRoom()
    const [showTooltip, setShowTooltip] = useState(true)

    const isActive = viewName === VIEWS.AICODES ? isAIOpen : activeView === viewName

    const handleViewClick = (viewName: VIEWS) => {
        if (viewName === VIEWS.AICODES) {
            setIsAIOpen(!isAIOpen)
        } else {
            if (viewName === activeView) {
                setIsSidebarOpen(!isSidebarOpen)
            } else {
                setIsSidebarOpen(true)
                setActiveView(viewName)
            }
        }
    }

    return (
        <div className="group relative flex flex-col items-center py-2.5 perspective-1000">
             <style dangerouslySetInnerHTML={{ __html: `
                @property --angle-1 {
                    syntax: "<angle>";
                    inherits: false;
                    initial-value: -75deg;
                }
                @property --angle-2 {
                    syntax: "<angle>";
                    inherits: false;
                    initial-value: -45deg;
                }

                .glass-master-btn {
                    --border-width: 1px;
                    transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1);
                }

                .glass-master-btn::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: 999px;
                    padding: var(--border-width);
                    background: conic-gradient(
                        from var(--angle-1) at 50% 50%,
                        rgba(255, 255, 255, 0.3),
                        rgba(255, 255, 255, 0) 5% 40%,
                        rgba(255, 255, 255, 0.3) 50%,
                        rgba(255, 255, 255, 0) 60% 95%,
                        rgba(255, 255, 255, 0.3)
                    );
                    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                    mask-composite: exclude;
                    transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1), --angle-1 500ms ease;
                }

                .glass-master-btn:hover::after {
                    --angle-1: -125deg;
                }

                .glass-master-btn .icon-sweep::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: 999px;
                    background: linear-gradient(
                        var(--angle-2),
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.4) 40% 50%,
                        rgba(255, 255, 255, 0) 55%
                    );
                    background-size: 200% 200%;
                    background-position: 0% 50%;
                    mix-blend-mode: screen;
                    pointer-events: none;
                    transition: all 500ms cubic-bezier(0.25, 1, 0.5, 1);
                }

                .glass-master-btn:hover .icon-sweep::after {
                    background-position: 100% 50%;
                }
             `}} />

            <button
                onClick={() => handleViewClick(viewName)}
                onMouseEnter={() => setShowTooltip(true)}
                className={cn(
                    "glass-master-btn relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
                    isActive 
                        ? "bg-gradient-to-br from-white/[0.08] via-white/[0.2] to-white/[0.08] shadow-[inset_0_0.125em_0.125em_rgba(0,0,0,0.05),inset_0_-0.125em_0.125em_rgba(255,255,255,0.5),0_0.25em_0.125em_-0.125em_rgba(0,0,0,0.2),inset_0_0_0.1em_0.25em_rgba(255,255,255,0.2)] backdrop-blur-[6px] text-white z-10 scale-[1.05]" 
                        : "bg-white/[0.03] text-white/30 hover:bg-white/[0.08] hover:text-white hover:scale-105"
                )}
                {...(showTooltip && {
                    "data-tooltip-id": `tooltip-${viewName}`,
                    "data-tooltip-content": viewName.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
                })}
            >
                <div className={cn(
                    "icon-sweep relative flex items-center justify-center w-full h-full transition-all duration-500",
                    isActive ? "scale-110 drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] text-white" : "group-hover:scale-110 group-hover:rotate-6"
                )}>
                    {icon}
                </div>

                {/* New Message Notification for Chat */}
                {viewName === VIEWS.CHATS && isNewMessage && (
                    <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.8)] z-20" />
                )}
            </button>

            {showTooltip && (
                <Tooltip
                    id={`tooltip-${viewName}`}
                    place="right"
                    offset={20}
                    className="!z-50"
                    border="1px solid rgba(255,255,255,0.1)"
                    style={{
                        ...tooltipStyles,
                        backgroundColor: '#1a1a1a',
                        color: '#fff',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        padding: '6px 12px'
                    }}
                />
            )}
        </div>
    )
}

export default ViewButton

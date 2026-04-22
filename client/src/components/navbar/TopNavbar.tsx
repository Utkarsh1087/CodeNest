import { useViews } from "@/context/ViewContext"
import { useAppContext } from "@/context/AppContext"
import { ACTIVITY_STATE } from "@/types/app"
import { LuSparkles } from "react-icons/lu"
import cn from "classnames"
import { useState } from "react"
import { Tooltip } from "react-tooltip"
import { tooltipStyles } from "../sidebar/tooltipStyles"

const TopNavbar = () => {
    const { isAIOpen, setIsAIOpen } = useViews()
    const { activityState, setActivityState } = useAppContext()
    const [showTooltip, setShowTooltip] = useState(true)

    return (
        <nav className="flex h-12 w-full items-center justify-between border-b border-white/5 bg-[#080808]/70 backdrop-blur-2xl px-6 shadow-2xl relative z-50">
            {/* Logo & Project Section */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 pr-6 border-r border-white/5">
                    <div className="relative">
                        <img
                            src="/src/assets/codenest.png"
                            alt="CodeNest Logo"
                            className="h-6 w-6 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(57,224,121,0.4)]"
                        />
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    </div>
                    <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white/90">
                        CodeNest
                    </span>
                </div>

                {/* Project Switcher Dropdown */}
                <button className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all group">
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter mb-0.5">Active Project</span>
                        <span className="text-[11px] font-bold text-white/80">Real Estate Landing Page</span>
                    </div>
                    <LuSparkles size={12} className="text-white/20 group-hover:text-primary transition-colors" />
                </button>
            </div>

            {/* Navigation Pill Group (Absolute Centered) - Slim Version */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 rounded-full p-1 shadow-2xl overflow-visible min-w-[180px]" style={{ filter: 'url(#gooey-liquid)' }}>
                {/* Liquid Background Indicator */}
                <div 
                    className={cn(
                        "absolute h-[calc(100%-8px)] top-1 rounded-full bg-primary shadow-[0_0_15px_-2px_rgba(57,224,121,0.5)] transition-all duration-700 cubic-bezier(0.5, 0, 0, 1)",
                        activityState === ACTIVITY_STATE.DRAWING ? "left-1 w-[calc(50%-4px)]" : "left-[calc(50%+1px)] w-[calc(50%-4px)]"
                    )}
                />

                <button 
                    onClick={() => setActivityState(ACTIVITY_STATE.DRAWING)}
                    className={cn(
                        "relative z-10 flex-1 px-5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-500",
                        activityState === ACTIVITY_STATE.DRAWING ? "text-black" : "text-white/30 hover:text-white/60"
                    )}
                >
                    Design
                </button>
                <button 
                    onClick={() => setActivityState(ACTIVITY_STATE.CODING)}
                    className={cn(
                        "relative z-10 flex-1 px-5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-500",
                        activityState === ACTIVITY_STATE.CODING ? "text-black" : "text-white/30 hover:text-white/60"
                    )}
                >
                    Code
                </button>

                {/* SVG Filter for Gooey Liquid Effect */}
                <svg className="hidden">
                    <defs>
                        <filter id="gooey-liquid">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                        </filter>
                    </defs>
                </svg>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsAIOpen(!isAIOpen)}
                    onMouseEnter={() => setShowTooltip(true)}
                    className={cn(
                        "group relative flex items-center h-8 px-4 rounded-full border transition-all duration-500 ease-out",
                        isAIOpen
                            ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_25px_-8px_rgba(57,224,121,0.4)]"
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white"
                    )}
                    data-tooltip-id="top-ai-toggle"
                    data-tooltip-content={isAIOpen ? "Disable AI View" : "Enable AI View"}
                >
                    <LuSparkles size={13} className={cn("transition-all duration-500", isAIOpen ? "rotate-12 scale-110" : "group-hover:rotate-45")} />
                    <span className="ml-2 text-[9px] font-black uppercase tracking-widest leading-none">Copilot</span>

                    {/* Status Beacon */}
                    <div className={cn(
                        "ml-2 h-1.5 w-1.5 rounded-full transition-all duration-500",
                        isAIOpen ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(57,224,121,0.8)]" : "bg-white/20"
                    )} />
                </button>

                {showTooltip && (
                    <Tooltip
                        id="top-ai-toggle"
                        place="bottom"
                        offset={10}
                        className="!z-[100]"
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
                        noArrow={true}
                    />
                )}
            </div>
        </nav>
    )
}

export default TopNavbar

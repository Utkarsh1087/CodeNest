import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton"
import { useViews } from "@/context/ViewContext"
import useResponsive from "@/hooks/useResponsive"
import { VIEWS } from "@/types/view"
import cn from "classnames"
function Sidebar() {
    const {
        activeView,
        isSidebarOpen,
        viewComponents,
        viewIcons,
    } = useViews()
    const { minHeightReached } = useResponsive()

    return (
        <aside className="flex w-full md:h-full md:max-h-full md:min-h-full md:w-auto md:gap-2 md:pl-2 md:pr-[2px] overflow-hidden">
            <div
                className={cn(
                    "fixed bottom-0 left-0 z-50 flex h-[60px] w-full gap-4 self-end overflow-hidden border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl p-2 md:static md:h-[calc(100%-24px)] md:w-[48px] md:min-w-[48px] md:flex-col md:border md:border-white/10 md:p-1 md:pt-4 md:mb-3 md:mt-3 md:rounded-2xl md:shadow-2xl md:bg-black/40 md:backdrop-blur-2xl",
                    {
                        hidden: minHeightReached,
                    },
                )}
            >
                {/* Views Section */}
                <div className="flex flex-grow gap-2 md:flex-col md:gap-6">
                    <SidebarButton
                        viewName={VIEWS.FILES}
                        icon={viewIcons[VIEWS.FILES]}
                    />
                    <SidebarButton
                        viewName={VIEWS.CHATS}
                        icon={viewIcons[VIEWS.CHATS]}
                    />
                    <SidebarButton
                        viewName={VIEWS.SEARCH}
                        icon={viewIcons[VIEWS.SEARCH]}
                    />
                    <SidebarButton
                        viewName={VIEWS.CLIENTS}
                        icon={viewIcons[VIEWS.CLIENTS]}
                    />
                </div>

                {/* Bottom Actions Section (Settings) */}
                <div className="flex h-fit items-center justify-center mt-auto md:border-t md:border-white/5 md:pt-4">
                    <SidebarButton
                        viewName={VIEWS.SETTINGS}
                        icon={viewIcons[VIEWS.SETTINGS]}
                    />
                </div>
            </div>

            {/* Expanded Sidebar View (Floating Island Style) */}
            <div
                className={cn(
                    "absolute left-0 top-0 z-20 w-full h-[calc(100%-24px)] mt-3 md:mb-3 md:pt-0 md:pb-0 md:pl-0 md:pr-0 bg-transparent transition-all duration-300 md:relative md:w-[280px] md:min-w-[280px]",
                    isSidebarOpen ? "flex" : "hidden"
                )}
            >
                <div className="w-full h-full bg-[#0d0d0d] rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
                    {viewComponents[activeView]}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar

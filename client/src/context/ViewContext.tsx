import ChatsView from "@/components/sidebar/sidebar-views/ChatsView"
import FilesView from "@/components/sidebar/sidebar-views/FilesView"
import SearchView from "@/components/sidebar/sidebar-views/SearchView"
import SettingsView from "@/components/sidebar/sidebar-views/SettingsView"
import UsersView from "@/components/sidebar/sidebar-views/UsersView"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { VIEWS, ViewContext as ViewContextType } from "@/types/view"
import { ReactNode, createContext, useContext, useState } from "react"
import { IoSettingsOutline } from "react-icons/io5"
import { LuFiles, LuUsers, LuMessageSquare, LuSearch } from "react-icons/lu"

const ViewContext = createContext<ViewContextType | null>(null)

export const useViews = (): ViewContextType => {
    const context = useContext(ViewContext)
    if (!context) {
        throw new Error("useViews must be used within a ViewContextProvider")
    }
    return context
}

function ViewContextProvider({ children }: { children: ReactNode }) {
    const { isMobile } = useWindowDimensions()
    const [activeView, setActiveView] = useState<VIEWS>(VIEWS.FILES)
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(!isMobile)
    const [isAIOpen, setIsAIOpen] = useState<boolean>(true)
    const [viewComponents] = useState<{ [key in VIEWS]?: ReactNode }>({
        [VIEWS.FILES]: <FilesView />,
        [VIEWS.CLIENTS]: <UsersView />,
        [VIEWS.SETTINGS]: <SettingsView />,
        [VIEWS.CHATS]: <ChatsView />,
        [VIEWS.SEARCH]: <SearchView />,
    })
    const [viewIcons] = useState<{ [key in VIEWS]?: ReactNode }>({
        [VIEWS.FILES]: <LuFiles size={15} />,
        [VIEWS.CLIENTS]: <LuUsers size={16} />,
        [VIEWS.SETTINGS]: <IoSettingsOutline size={16} />,
        [VIEWS.CHATS]: <LuMessageSquare size={16} />,
        [VIEWS.SEARCH]: <LuSearch size={16} />,
    })

    return (
        <ViewContext.Provider
            value={{
                activeView,
                setActiveView,
                isSidebarOpen,
                setIsSidebarOpen,
                isAIOpen,
                setIsAIOpen,
                viewComponents,
                viewIcons,
            }}
        >
            {children}
        </ViewContext.Provider>
    )
}

export { ViewContextProvider }
export default ViewContext

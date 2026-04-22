import React from "react"

enum VIEWS {
    FILES = "FILES",
    CHATS = "CHATS",
    CLIENTS = "CLIENTS",
    SEARCH = "SEARCH",
    AICODES = "AICODES",
    SETTINGS = "SETTINGS",
}

interface ViewContext {
    activeView: VIEWS
    setActiveView: (view: VIEWS) => void
    isSidebarOpen: boolean
    setIsSidebarOpen: (isOpen: boolean) => void
    isAIOpen: boolean
    setIsAIOpen: (isOpen: boolean) => void
    viewComponents: { [key in VIEWS]?: React.ReactNode }
    viewIcons: { [key in VIEWS]?: React.ReactNode }
}

export { ViewContext, VIEWS }

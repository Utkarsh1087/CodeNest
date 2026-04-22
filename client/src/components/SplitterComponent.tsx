// High-Fidelity Splitter Component
import { useViews } from "@/context/ViewContext"
import useLocalStorage from "@/hooks/useLocalStorage"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ReactNode } from "react"
import Split from "react-split"

function SplitterComponent({ children }: { children: ReactNode }) {
    const { isSidebarOpen, isAIOpen } = useViews()
    const { isMobile, width } = useWindowDimensions()
    const { setItem } = useLocalStorage()

    const getGutter = () => {
        const gutter = document.createElement("div")
        gutter.className = "h-full cursor-col-resize hidden md:block"
        gutter.style.backgroundColor = "transparent"
        return gutter
    }

    const getSizes = () => {
        if (isMobile) return [0, width, 0]
        const sidebarWidth = isSidebarOpen ? 352 : 64
        const aiWidth = isAIOpen ? 320 : 0
        
        const sidebarPercent = (sidebarWidth / width) * 100
        const aiPercent = (aiWidth / width) * 100
        const workspacePercent = 100 - sidebarPercent - aiPercent

        return [sidebarPercent, workspacePercent, aiPercent]
    }

    const getMinSizes = () => {
        if (isMobile) return [0, width, 0]
        const sidebarMin = isSidebarOpen ? 352 : 64
        const aiMin = isAIOpen ? 320 : 0
        return [sidebarMin, 400, aiMin]
    }

    const getMaxSizes = () => {
        if (isMobile) return [0, Infinity, 0]
        const sidebarMax = isSidebarOpen ? Infinity : 54
        const aiMax = isAIOpen ? Infinity : 0
        return [sidebarMax, Infinity, aiMax]
    }

    const handleGutterDrag = (sizes: number[]) => {
        setItem("editorSizes", JSON.stringify(sizes))
    }



    return (
        <Split
            sizes={getSizes()}
            minSize={getMinSizes()}
            gutter={getGutter}
            maxSize={getMaxSizes()}
            dragInterval={1}
            direction="horizontal"
            gutterAlign="center"
            cursor="e-resize"
            snapOffset={30}
            gutterStyle={() => ({
                width: "2px",
                backgroundColor: "transparent",
            })}
            onDrag={handleGutterDrag}
            className="flex h-full w-full overflow-hidden"
        >
            {children}
        </Split>
    )
}

export default SplitterComponent

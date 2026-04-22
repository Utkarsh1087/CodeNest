import { useFileSystem } from "@/context/FileContext"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import { IoClose } from "react-icons/io5"
import cn from "classnames"
import { useEffect, useRef } from "react"
import customMapping from "@/utils/customMapping"
import { useSettings } from "@/context/SettingContext"
import langMap from "lang-map"

function FileTab() {
    const {
        openFiles,
        closeFile,
        activeFile,
        updateFileContent,
        setActiveFile,
    } = useFileSystem()
    const fileTabRef = useRef<HTMLDivElement>(null)
    const { setLanguage } = useSettings()

    const changeActiveFile = (fileId: string) => {
        // If the file is already active, do nothing
        if (activeFile?.id === fileId) return

        updateFileContent(activeFile?.id || "", activeFile?.content || "")

        const file = openFiles.find((file) => file.id === fileId)
        if (file) {
            setActiveFile(file)
        }
    }

    useEffect(() => {
        const fileTabNode = fileTabRef.current
        if (!fileTabNode) return

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                fileTabNode.scrollLeft += 100
            } else {
                fileTabNode.scrollLeft -= 100
            }
        }

        fileTabNode.addEventListener("wheel", handleWheel)

        return () => {
            fileTabNode.removeEventListener("wheel", handleWheel)
        }
    }, [])

    // Update the editor language when a file is opened
    useEffect(() => {
        if (activeFile?.name === undefined) return
        // Get file extension on file open and set language when file is opened
        const extension = activeFile.name.split(".").pop()
        if (!extension) return

        // Check if custom mapping exists
        if (customMapping[extension]) {
            setLanguage(customMapping[extension])
            return
        }

        const language = langMap.languages(extension)
        setLanguage(language[0])
    }, [activeFile?.name, setLanguage])

    return (
        <div
            className="flex h-[45px] w-full select-none gap-2 overflow-x-auto px-4 py-2 custom-scrollbar bg-black/10 items-center"
            ref={fileTabRef}
        >
            {openFiles.map((file) => (
                <div
                    key={file.id}
                    className={cn(
                        "group flex h-7 min-w-fit items-center rounded-lg px-3 transition-all duration-300 border mb-0.5",
                        file.id === activeFile?.id 
                            ? "bg-white/[0.08] border-white/10 text-white shadow-[0_4px_15px_-5px_rgba(57,224,121,0.3)] border-b-primary border-b-[1.5px] z-10" 
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white/60"
                    )}
                    onClick={() => changeActiveFile(file.id)}
                >
                    <Icon
                        icon={getIconClassName(file.name)}
                        fontSize={14}
                        className={cn(
                            "mr-2 transition-transform duration-300",
                            file.id === activeFile?.id ? "scale-110" : "group-hover:scale-110"
                        )}
                    />
                    <span
                        className="text-[10.5px] font-bold tracking-tight whitespace-nowrap"
                        title={file.name}
                    >
                        {file.name}
                    </span>
                    <button
                        className="ml-3 p-0.5 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation()
                            closeFile(file.id)
                        }}
                    >
                        <IoClose size={12} />
                    </button>
                </div>
            ))}
        </div>
    )
}

export default FileTab

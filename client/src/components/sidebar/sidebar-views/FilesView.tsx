import  { useState } from "react"
import FileStructureView from "@/components/files/FileStructureView"
import { useFileSystem } from "@/context/FileContext"
import useResponsive from "@/hooks/useResponsive"
import { FileSystemItem } from "@/types/file"
import cn from "classnames"
import { BiArchiveIn } from "react-icons/bi"
import { TbFileUpload } from "react-icons/tb"
import { LuSearch } from "react-icons/lu"
import { v4 as uuidV4 } from "uuid"
import { toast } from "react-hot-toast"

function FilesView() {
    const { downloadFilesAndFolders, updateDirectory } = useFileSystem()
    const { minHeightReached } = useResponsive()
    const [isLoading, setIsLoading] = useState(false)

    const handleOpenDirectory = async () => {
        try {
            setIsLoading(true)

            // Check for modern API support
            if ("showDirectoryPicker" in window) {
                const directoryHandle = await window.showDirectoryPicker()
                await processDirectoryHandle(directoryHandle)
                return
            }

            // Fallback for browsers without `showDirectoryPicker`
            if ("webkitdirectory" in HTMLInputElement.prototype) {
                const fileInput = document.createElement("input")
                fileInput.type = "file"
                ;(fileInput as any).webkitdirectory = true

                fileInput.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) {
                        const structure = await readFileList(files)
                        updateDirectory("", structure)
                    }
                }

                fileInput.click()
                return
            }

            // Notify if neither API is supported
            toast.error("Your browser does not support directory selection.")
        } catch (error) {
            console.error("Error opening directory:", error)
            toast.error("Failed to open directory")
        } finally {
            setIsLoading(false)
        }
    }

    const processDirectoryHandle = async (
        directoryHandle: FileSystemDirectoryHandle
    ) => {
        try {
            toast.loading("Getting files and folders...")
            const structure = await readDirectory(directoryHandle)
            updateDirectory("", structure)
            toast.dismiss()
            toast.success("Directory loaded successfully")
        } catch (error) {
            console.error("Error processing directory:", error)
            toast.error("Failed to process directory")
        }
    }

    const readDirectory = async (
        directoryHandle: FileSystemDirectoryHandle
    ): Promise<FileSystemItem[]> => {
        const children: FileSystemItem[] = []
        const blackList = ["node_modules", ".git", ".vscode", ".next"]

        for await (const entry of directoryHandle.values()) {
            if (entry.kind === "file") {
                const file = await entry.getFile()
                const newFile: FileSystemItem = {
                    id: uuidV4(),
                    name: entry.name,
                    type: "file",
                    content: await readFileContent(file),
                }
                children.push(newFile)
            } else if (entry.kind === "directory") {
                if (blackList.includes(entry.name)) continue

                const newDirectory: FileSystemItem = {
                    id: uuidV4(),
                    name: entry.name,
                    type: "directory",
                    children: await readDirectory(entry),
                    isOpen: false,
                }
                children.push(newDirectory)
            }
        }
        return children
    }

    const readFileList = async (files: FileList): Promise<FileSystemItem[]> => {
        const children: FileSystemItem[] = []
        const blackList = ["node_modules", ".git", ".vscode", ".next"]

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const pathParts = file.webkitRelativePath.split("/")

            if (pathParts.some((part) => blackList.includes(part))) continue

            if (pathParts.length > 1) {
                const directoryPath = pathParts.slice(0, -1).join("/")
                const directoryIndex = children.findIndex(
                    (item) =>
                        item.name === directoryPath && item.type === "directory"
                )

                if (directoryIndex === -1) {
                    const newDirectory: FileSystemItem = {
                        id: uuidV4(),
                        name: directoryPath,
                        type: "directory",
                        children: [],
                        isOpen: false,
                    }
                    children.push(newDirectory)
                }

                const newFile: FileSystemItem = {
                    id: uuidV4(),
                    name: file.name,
                    type: "file",
                    content: await readFileContent(file),
                }

                const targetDirectory = children.find(
                    (item) =>
                        item.name === directoryPath && item.type === "directory"
                )
                if (targetDirectory && targetDirectory.children) {
                    targetDirectory.children.push(newFile)
                }
            } else {
                const newFile: FileSystemItem = {
                    id: uuidV4(),
                    name: file.name,
                    type: "file",
                    content: await readFileContent(file),
                }
                children.push(newFile)
            }
        }
        return children
    }

    const readFileContent = async (file: File): Promise<string> => {
        const MAX_FILE_SIZE = 1024 * 1024; // 1MB limit

        if (file.size > MAX_FILE_SIZE) {
            return `File too large: ${file.name} (${Math.round(
                file.size / 1024
            )}KB)`
        }

        try {
            return await file.text()
        } catch (error) {
            console.error(`Error reading file ${file.name}:`, error)
            return `Error reading file: ${file.name}`
        }
    }

    return (
        <div
            className="flex select-none flex-col h-full overflow-hidden"
        >
            {/* Explorer Search HUD */}
            <div className="px-5 pt-5 pb-4">
                <div className="relative group">
                    <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search files..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[11px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-grow overflow-hidden custom-scrollbar">
                <FileStructureView />
            </div>

            <div
                className={cn(`flex min-h-fit flex-col justify-end px-3 py-2 pb-4 bg-black/40 backdrop-blur-md gap-1`, {
                    hidden: minHeightReached,
                })}
            >
                <button
                    className="flex w-full items-center justify-start rounded-lg px-3 py-1.5 transition-all hover:bg-white/[0.05] text-white/60 hover:text-white group"
                    onClick={handleOpenDirectory}
                    disabled={isLoading}
                >
                    <TbFileUpload className="mr-3 text-white/40 group-hover:text-white transition-colors" size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{isLoading ? "Loading..." : "Open File/Folder"}</span>
                </button>
                <button
                    className="flex w-full items-center justify-start rounded-lg px-3 py-1.5 transition-all hover:bg-white/[0.05] text-white/60 hover:text-white group"
                    onClick={downloadFilesAndFolders}
                >
                    <BiArchiveIn className="mr-3 text-white/40 group-hover:text-white transition-colors" size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Download Code</span>
                </button>
            </div>
        </div>
    )
}

export default FilesView

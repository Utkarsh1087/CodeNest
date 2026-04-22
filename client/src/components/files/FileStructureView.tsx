import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useViews } from "@/context/ViewContext"
import { useContextMenu } from "@/hooks/useContextMenu"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { FileSystemItem, Id } from "@/types/file"
import { sortFileSystemItem } from "@/utils/file"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import cn from "classnames"
import { MouseEvent, useEffect, useRef, useState } from "react"

import { MdDelete } from "react-icons/md"
import { PiPencilSimpleFill } from "react-icons/pi"
import {
    RiFileAddLine,
    RiFolderAddLine,
    RiFolderUploadLine,
} from "react-icons/ri"
import { LuChevronRight, LuChevronDown, LuFolder, LuFolderOpen } from "react-icons/lu"
import RenameView from "./RenameView"
import useResponsive from "@/hooks/useResponsive"

function FileStructureView() {
    const { fileStructure, createFile, createDirectory, collapseDirectories } =
        useFileSystem()
    const explorerRef = useRef<HTMLDivElement | null>(null)
    const [selectedDirId, setSelectedDirId] = useState<Id | null>(null)
    const { minHeightReached } = useResponsive()

    const handleClickOutside = (e: MouseEvent) => {
        if (
            explorerRef.current &&
            !explorerRef.current.contains(e.target as Node)
        ) {
            setSelectedDirId(fileStructure.id)
        }
    }

    const handleCreateFile = () => {
        const fileName = prompt("Enter file name")
        if (fileName) {
            const parentDirId: Id = selectedDirId || fileStructure.id
            createFile(parentDirId, fileName)
        }
    }

    const handleCreateDirectory = () => {
        const dirName = prompt("Enter directory name")
        if (dirName) {
            const parentDirId: Id = selectedDirId || fileStructure.id
            createDirectory(parentDirId, dirName)
        }
    }

    const sortedFileStructure = sortFileSystemItem(fileStructure)

    return (
        <div onClick={handleClickOutside} className="flex flex-grow flex-col">
            <div className="view-title flex items-center justify-between px-5 py-4 bg-dark/20 border-b border-white/5 mb-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Explorer</h2>
                <div className="flex gap-1">
                    <button
                        className="rounded-md p-1.5 text-white/30 hover:bg-white/10 hover:text-primary transition-colors"
                        onClick={handleCreateFile}
                        title="New File"
                    >
                        <RiFileAddLine size={16} />
                    </button>
                    <button
                        className="rounded-md p-1.5 text-white/30 hover:bg-white/10 hover:text-primary transition-colors"
                        onClick={handleCreateDirectory}
                        title="New Folder"
                    >
                        <RiFolderAddLine size={16} />
                    </button>
                    <button
                        className="rounded-md p-1.5 text-white/30 hover:bg-white/10 hover:text-primary transition-colors"
                        onClick={collapseDirectories}
                        title="Collapse All"
                    >
                        <RiFolderUploadLine size={16} />
                    </button>
                </div>
            </div>
            <div
                className={cn(
                    "custom-scrollbar flex-grow overflow-x-hidden overflow-y-auto pr-0",
                    {
                        "h-[calc(80vh-170px)]": !minHeightReached,
                        "h-[85vh]": minHeightReached,
                    },
                )}
                ref={explorerRef}
            >
                {sortedFileStructure.children &&
                    sortedFileStructure.children.map((item) => (
                        <Directory
                            key={item.id}
                            item={item}
                            setSelectedDirId={setSelectedDirId}
                        />
                    ))}
            </div>
        </div>
    )
}

function Directory({
    item,
    setSelectedDirId,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
}) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const dirRef = useRef<HTMLDivElement | null>(null)
    const { coords, menuOpen, setMenuOpen } = useContextMenu({
        ref: dirRef,
    })
    const { deleteDirectory, toggleDirectory } = useFileSystem()

    const handleDirClick = (dirId: string) => {
        setSelectedDirId(dirId)
        toggleDirectory(dirId)
    }

    const handleRenameDirectory = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setEditing(true)
    }

    const handleDeleteDirectory = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        setMenuOpen(false)
        const isConfirmed = confirm(
            `Are you sure you want to delete directory?`,
        )
        if (isConfirmed) {
            deleteDirectory(id)
        }
    }

    useEffect(() => {
        const dirNode = dirRef.current
        if (!dirNode) return
        dirNode.tabIndex = 0
        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") {
                setEditing(true)
            }
        }
        dirNode.addEventListener("keydown", handleF2)
        return () => dirNode.removeEventListener("keydown", handleF2)
    }, [])

    if (item.type === "file") {
        return <File item={item} setSelectedDirId={setSelectedDirId} />
    }

    return (
        <div className="w-full">
            <div
                className="group flex w-full cursor-pointer items-center px-5 py-2 transition-colors hover:bg-white/[0.03] active:bg-white/5 overflow-hidden"
                onClick={() => handleDirClick(item.id)}
                ref={dirRef}
            >
                <div className="mr-2 text-white/20 group-hover:text-white/40 transition-colors">
                    {item.isOpen ? (
                        <LuChevronDown size={14} />
                    ) : (
                        <LuChevronRight size={14} />
                    )}
                </div>
                <div className="mr-2 text-white/30 group-hover:text-white/50 transition-colors">
                    {item.isOpen ? (
                        <LuFolderOpen size={16} />
                    ) : (
                        <LuFolder size={16} />
                    )}
                </div>
                {isEditing ? (
                    <RenameView
                        id={item.id}
                        preName={item.name}
                        type="directory"
                        setEditing={setEditing}
                    />
                ) : (
                    <span
                        className="flex-grow overflow-hidden truncate text-[13px] font-medium text-white/80 group-hover:text-white transition-colors"
                        title={item.name}
                    >
                        {item.name}
                    </span>
                )}
            </div>
            <div
                className={cn(
                    "ml-5 border-l border-white/5 pl-2",
                    { hidden: !item.isOpen },
                    { block: item.isOpen }
                )}
            >
                {item.children &&
                    item.children.map((child) => (
                        <Directory
                            key={child.id}
                            item={child}
                            setSelectedDirId={setSelectedDirId}
                        />
                    ))}
            </div>

            {menuOpen && (
                <DirectoryMenu
                    handleDeleteDirectory={handleDeleteDirectory}
                    handleRenameDirectory={handleRenameDirectory}
                    id={item.id}
                    left={coords.x}
                    top={coords.y}
                />
            )}
        </div>
    )
}

const File = ({
    item,
    setSelectedDirId,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
}) => {
    const { deleteFile, openFile, activeFile } = useFileSystem()
    const [isEditing, setEditing] = useState<boolean>(false)
    const { setIsSidebarOpen } = useViews()
    const { isMobile } = useWindowDimensions()
    const { activityState, setActivityState } = useAppContext()
    const fileRef = useRef<HTMLDivElement | null>(null)
    const { menuOpen, coords, setMenuOpen } = useContextMenu({
        ref: fileRef,
    })

    const isActive = activeFile?.id === item.id

    const handleFileClick = (fileId: string) => {
        if (isEditing) return
        setSelectedDirId(fileId)
        openFile(fileId)
        if (isMobile) setIsSidebarOpen(false)
        if (activityState === ACTIVITY_STATE.DRAWING) setActivityState(ACTIVITY_STATE.CODING)
    }

    const handleRenameFile = (e: MouseEvent) => {
        e.stopPropagation()
        setEditing(true)
        setMenuOpen(false)
    }

    const handleDeleteFile = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        setMenuOpen(false)
        if (confirm(`Are you sure you want to delete file?`)) deleteFile(id)
    }

    useEffect(() => {
        const fileNode = fileRef.current
        if (!fileNode) return
        fileNode.tabIndex = 0
        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") setEditing(true)
        }
        fileNode.addEventListener("keydown", handleF2)
        return () => fileNode.removeEventListener("keydown", handleF2)
    }, [])

    return (
        <div
            className={cn(
                "group relative flex cursor-pointer items-center px-5 py-1.5 transition-all mx-1 mb-0.5 rounded-lg overflow-hidden",
                isActive ? "bg-white/[0.06] shadow-inner border border-white/5" : "hover:bg-white/[0.03]"
            )}
            onClick={() => handleFileClick(item.id)}
            ref={fileRef}
        >
            <div className="w-4 h-4 mr-2.5 flex items-center justify-center">
                <Icon
                    icon={getIconClassName(item.name)}
                    fontSize={16}
                    className={cn("transition-all duration-300", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "text-white/30 group-hover:text-white/60")}
                />
            </div>
            {isEditing ? (
                <RenameView
                    id={item.id}
                    preName={item.name}
                    type="file"
                    setEditing={setEditing}
                />
            ) : (
                <span
                    className={cn(
                        "flex-grow overflow-hidden truncate text-[12px] transition-colors tracking-tight",
                        isActive ? "font-bold text-white shadow-text-glow" : "font-medium text-white/50 group-hover:text-white/80"
                    )}
                    title={item.name}
                >
                    {item.name}
                </span>
            )}

            {menuOpen && (
                <FileMenu
                    top={coords.y}
                    left={coords.x}
                    id={item.id}
                    handleRenameFile={handleRenameFile}
                    handleDeleteFile={handleDeleteFile}
                />
            )}
        </div>
    )
}

const FileMenu = ({
    top,
    left,
    id,
    handleRenameFile,
    handleDeleteFile,
}: {
    top: number
    left: number
    id: Id
    handleRenameFile: (e: MouseEvent) => void
    handleDeleteFile: (e: MouseEvent, id: Id) => void
}) => {
    return (
        <div
            className="fixed z-[100] w-[160px] overflow-hidden rounded-lg border border-white/10 bg-[#1e1e1e] p-1 shadow-2xl backdrop-blur-xl"
            style={{ top, left }}
        >
            <button
                onClick={handleRenameFile}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-primary hover:text-black"
            >
                <PiPencilSimpleFill size={14} />
                Rename
            </button>
            <button
                onClick={(e) => handleDeleteFile(e, id)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger hover:text-white"
            >
                <MdDelete size={14} />
                Delete
            </button>
        </div>
    )
}

const DirectoryMenu = ({
    top,
    left,
    id,
    handleRenameDirectory,
    handleDeleteDirectory,
}: {
    top: number
    left: number
    id: Id
    handleRenameDirectory: (e: MouseEvent) => void
    handleDeleteDirectory: (e: MouseEvent, id: Id) => void
}) => {
    return (
        <div
            className="fixed z-[100] w-[160px] overflow-hidden rounded-lg border border-white/10 bg-[#1e1e1e] p-1 shadow-2xl backdrop-blur-xl"
            style={{ top, left }}
        >
            <button
                onClick={handleRenameDirectory}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-primary hover:text-black"
            >
                <PiPencilSimpleFill size={14} />
                Rename
            </button>
            <button
                onClick={(e) => handleDeleteDirectory(e, id)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger hover:text-white"
            >
                <MdDelete size={14} />
                Delete
            </button>
        </div>
    )
}

export default FileStructureView

import { useFileSystem } from "@/context/FileContext"
import Editor from "./Editor"
import FileTab from "./FileTab"

function EditorComponent() {
    const { openFiles } = useFileSystem()

    if (openFiles.length <= 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <h1 className="text-xl text-white">
                    No file is currently open.
                </h1>
            </div>
        )
    }

    return (
        <main className="flex flex-grow flex-col w-full bg-white/[0.03] backdrop-blur-[40px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden shadow-black/40 h-full">
                <FileTab />
                <div className="flex-grow relative overflow-hidden bg-transparent">
                    <Editor />
                </div>
        </main>
    )
}

export default EditorComponent

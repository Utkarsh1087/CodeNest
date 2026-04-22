import Select from "@/components/common/Select"
import DeleteConfirmation from "@/components/common/DeleteConfirmation"
import { useSettings } from "@/context/SettingContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { editorFonts } from "@/resources/Fonts"
import { editorThemes } from "@/resources/Themes"
import { SocketEvent } from "@/types/socket"
import { langNames } from "@uiw/codemirror-extensions-langs"
import { ChangeEvent, useEffect, useState } from "react"
import { LuTrash2, LuAlertTriangle, LuUndo2 } from "react-icons/lu"

function SettingsView() {
    const {
        theme,
        setTheme,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        resetSettings,
    } = useSettings()
    const { viewHeight } = useResponsive()
    const { socket } = useSocket()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleFontFamilyChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontFamily(e.target.value)
    const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setTheme(e.target.value)
    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setLanguage(e.target.value)
    const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontSize(parseInt(e.target.value))

    const handleDeleteRoom = () => {
        socket.emit(SocketEvent.DELETE_ROOM)
        setShowDeleteModal(false)
    }

    useEffect(() => {
        // Set editor font family
        const editor = document.querySelector(
            ".cm-editor > .cm-scroller",
        ) as HTMLElement
        if (editor !== null) {
            editor.style.fontFamily = `${fontFamily}, monospace`
        }
    }, [fontFamily])

    return (
        <div
            className="flex flex-col p-4 custom-scrollbar overflow-auto relative h-full"
            style={{ height: viewHeight }}
        >
            <h1 className="view-title text-center mb-8">System Settings</h1>
            
            <div className="flex flex-col gap-8 flex-grow">
                {/* Visual Section ... */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white/80">Appearance</h3>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex w-full items-end gap-3">
                            <div className="flex-grow">
                                <Select
                                    onChange={handleFontFamilyChange}
                                    value={fontFamily}
                                    options={editorFonts}
                                    title="Font Family"
                                />
                            </div>
                            <div className="flex flex-col gap-2 min-w-[80px]">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-white/30 ml-1">Size</label>
                                <select
                                    value={fontSize}
                                    onChange={handleFontSizeChange}
                                    className="w-full appearance-none rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/80 outline-none transition-all hover:bg-white/10"
                                >
                                    {[...Array(13).keys()].map((size) => (
                                        <option key={size} value={size + 12} className="bg-dark">
                                            {size + 12}px
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Select
                            onChange={handleThemeChange}
                            value={theme}
                            options={Object.keys(editorThemes)}
                            title="Editor Theme"
                        />
                    </div>
                </section>

                {/* Editor Engine Section */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white/80">Engine</h3>
                    </div>

                    <div>
                        <Select
                            onChange={handleLanguageChange}
                            value={language}
                            options={langNames}
                            title="Primary Language"
                        />
                    </div>
                </section>

                {/* Refined Danger Zone */}
                <section className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-1 opacity-40">
                        <LuAlertTriangle size={12} className="text-danger" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Danger Zone</h3>
                    </div>
                    
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="group flex items-center justify-between w-full p-3 rounded-xl bg-white/[0.02] border border-white/5 transition-all hover:border-danger/30 hover:bg-danger/10"
                    >
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[11px] font-bold text-white/60 group-hover:text-danger tracking-tight">Delete Project</span>
                            <span className="text-[9px] text-white/20 font-medium tracking-tight">Permanent cloud purge</span>
                        </div>
                        <LuTrash2 size={14} className="text-white/10 group-hover:text-danger transition-all" />
                    </button>
                </section>
            </div>

            <button
                className="mt-8 flex items-center justify-center gap-2 w-full rounded-xl border border-white/5 bg-white/5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 transition-all hover:border-white/10 hover:text-white/60 active:scale-95"
                onClick={resetSettings}
            >
                <LuUndo2 size={14} />
                Reset Defaults
            </button>

            {/* Custom Confirmation HUD */}
            <DeleteConfirmation 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteRoom}
            />
        </div>
    )
}

export default SettingsView

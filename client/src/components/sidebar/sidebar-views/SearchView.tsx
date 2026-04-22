import { useFileSystem } from "@/context/FileContext"
import { useViews } from "@/context/ViewContext"
import { useState, useMemo } from "react"
import { LuSearch, LuReplace, LuChevronRight, LuChevronDown } from "react-icons/lu"
import cn from "classnames"

interface SearchResult {
    fileId: string
    fileName: string
    matches: {
        line: number
        content: string
        index: number
    }[]
}

const SearchView = () => {
    const { fileStructure, updateFileContent } = useFileSystem()
    // Remove unused setIsSidebarOpen
    const [searchTerm, setSearchTerm] = useState("")
    const [replaceTerm, setReplaceTerm] = useState("")
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

    const results = useMemo(() => {
        if (!searchTerm.trim()) return []
        
        const searchResults: SearchResult[] = []
        
        // Recursive function to search in files
        const searchInFiles = (fileList: any[]) => {
            fileList.forEach(file => {
                if (file.type === "file" && file.content) {
                    const lines = file.content.split("\n")
                    const matches: any[] = []
                    
                    lines.forEach((line: string, i: number) => {
                        if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
                            matches.push({
                                line: i + 1,
                                content: line,
                                index: line.toLowerCase().indexOf(searchTerm.toLowerCase())
                            })
                        }
                    })

                    if (matches.length > 0) {
                        searchResults.push({
                            fileId: file.id,
                            fileName: file.name,
                            matches
                        })
                    }
                }
                if (file.children) {
                    searchInFiles(file.children)
                }
            })
        }

        if (fileStructure.children) {
            searchInFiles(fileStructure.children)
        }
        return searchResults
    }, [fileStructure, searchTerm])

    const toggleFile = (id: string) => {
        const newSet = new Set(expandedFiles)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setExpandedFiles(newSet)
    }

    const handleReplaceAll = () => {
        if (!searchTerm || !fileStructure.children) return
        results.forEach(res => {
            const file = findFileById(fileStructure.children!, res.fileId)
            if (file && file.content) {
                const newContent = file.content.replaceAll(searchTerm, replaceTerm)
                updateFileContent(res.fileId, newContent)
            }
        })
    }

    const findFileById = (fileList: any[], id: string): any => {
        for (const file of fileList) {
            if (file.id === id) return file
            if (file.children) {
                const found = findFileById(file.children, id)
                if (found) return found
            }
        }
        return null
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] font-sans">
            <div className="pt-4 pb-4 px-4 border-b border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <LuSearch className="text-white/30" size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 text-center">Search & Replace</span>
                </div>
                
                {/* Inputs */}
                <div className="space-y-2">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.08] transition-all"
                        />
                        <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary" size={14} />
                    </div>
                    
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Replace"
                            value={replaceTerm}
                            onChange={(e) => setReplaceTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.08] transition-all"
                        />
                        <LuReplace className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary" size={14} />
                    </div>
                </div>

                {results.length > 0 && (
                    <button
                        onClick={handleReplaceAll}
                        className="w-full py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        <LuReplace size={12} />
                        Replace All
                    </button>
                )}
            </div>

            {/* Results Area */}
            <div className="flex-grow overflow-auto p-4 custom-scrollbar">
                {results.length === 0 ? (
                    searchTerm ? (
                        <div className="p-8 text-center opacity-30">
                            <LuSearch size={32} className="mx-auto mb-4" />
                            <p className="text-xs uppercase tracking-widest">No results found</p>
                        </div>
                    ) : (
                        <div className="p-8 text-center opacity-10">
                            <LuSearch size={32} className="mx-auto mb-4" />
                            <p className="text-[10px] uppercase tracking-widest leading-relaxed">Enter text to search<br/>across all files</p>
                        </div>
                    )
                ) : (
                    <div className="px-2 pr-6 space-y-1">
                        <div className="px-2 py-1 mb-2">
                            <span className="text-[9px] font-bold uppercase text-white/20 tracking-wider">
                                {results.reduce((acc, r) => acc + r.matches.length, 0)} results in {results.length} files
                            </span>
                        </div>
                        {results.map((res) => (
                            <div key={res.fileId} className="group flex flex-col">
                                <button
                                    onClick={() => toggleFile(res.fileId)}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                                >
                                    {expandedFiles.has(res.fileId) ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />}
                                    <span className="text-xs font-medium truncate">{res.fileName}</span>
                                    <span className="text-[9px] bg-white/10 px-1.5 rounded-full ml-auto">{res.matches.length}</span>
                                </button>
                                
                                {expandedFiles.has(res.fileId) && (
                                    <div className="ml-4 border-l border-white/5 mt-1 space-y-0.5 pl-1">
                                        {res.matches.map((match, i) => (
                                            <div 
                                                key={i} 
                                                className="flex flex-col px-3 py-1.5 rounded hover:bg-white/5 cursor-pointer group/match relative overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[9px] font-mono text-white/20">LINE {match.line}</span>
                                                </div>
                                                <p className="text-[11px] font-mono whitespace-nowrap overflow-hidden text-ellipsis text-white/40 group-hover/match:text-white/80 transition-colors">
                                                    {match.content.trim()}
                                                </p>
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/40 opacity-0 group-hover/match:opacity-100" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchView

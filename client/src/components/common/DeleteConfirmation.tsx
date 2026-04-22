import { motion, AnimatePresence } from "framer-motion"
import { LuAlertTriangle, LuX, LuTrash2 } from "react-icons/lu"

interface DeleteConfirmationProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

const DeleteConfirmation = ({ isOpen, onClose, onConfirm }: DeleteConfirmationProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center pb-12 pointer-events-none">
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Confirmation Card */}
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-[400px] bg-[#0d0d0d] border border-danger/30 rounded-3xl p-6 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] pointer-events-auto overflow-hidden"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-danger shadow-[0_0_20px_2px_rgba(239,68,68,0.5)] rounded-full" />
                        
                        <div className="flex flex-col gap-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-danger/10 text-danger border border-danger/20">
                                        <LuAlertTriangle size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Critical Action</h3>
                                        <p className="text-[10px] font-bold text-danger/80">PERMANENT DELETION</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 rounded-xl bg-white/5 text-white/20 hover:text-white transition-all"
                                >
                                    <LuX size={16} />
                                </button>
                            </div>

                            <p className="text-xs text-white/50 leading-relaxed font-medium">
                                You are about to purge this project from the cloud. All code, AI history, and designs will be <span className="text-white">permanently lost</span>. Are you sure you want to proceed?
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-grow py-3 rounded-xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-grow py-3 rounded-xl bg-danger text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-danger/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <LuTrash2 size={14} />
                                    Purge Room
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default DeleteConfirmation

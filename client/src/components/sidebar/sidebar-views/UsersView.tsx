import Users from "@/components/common/Users"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { USER_STATUS } from "@/types/user"
import toast from "react-hot-toast"
import { IoShareOutline } from "react-icons/io5"
import { LuCopy } from "react-icons/lu"
import { useNavigate } from "react-router-dom"

function UsersView() {
    const navigate = useNavigate()
    const { viewHeight } = useResponsive()
    const { setStatus } = useAppContext()
    const { socket } = useSocket()

    const copyURL = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success("URL copied to clipboard")
        } catch (error) {
            toast.error("Unable to copy URL to clipboard")
            console.log(error)
        }
    }

    const shareURL = async () => {
        const url = window.location.href
        try {
            await navigator.share({ url })
        } catch (error) {
            toast.error("Unable to share URL")
            console.log(error)
        }
    }


    return (
        <div className="flex flex-col p-4 custom-scrollbar overflow-auto" style={{ height: viewHeight }}>
            <h1 className="view-title text-center mb-6">Active Peers</h1>
            
            {/* List of connected users */}
            <Users />
            
            <div className="flex flex-col gap-3 pt-6 mt-auto">
                <div className="grid grid-cols-2 gap-3">
                    {/* Share URL button */}
                    <button
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/5 py-1.5 px-4 text-white/60 transition-all hover:bg-white/10 hover:text-white active:scale-95 shadow-sm"
                        onClick={shareURL}
                        title="Share Invite Link"
                    >
                        <IoShareOutline size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Share</span>
                    </button>
                    {/* Copy URL button */}
                    <button
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/5 py-1.5 px-4 text-white/60 transition-all hover:bg-white/10 hover:text-white active:scale-95 shadow-sm"
                        onClick={copyURL}
                        title="Copy Workspace URL"
                    >
                        <LuCopy size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Copy</span>
                    </button>
                </div>
                
            </div>
        </div>
    )
}

export default UsersView

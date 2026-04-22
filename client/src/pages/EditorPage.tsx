import SplitterComponent from "@/components/SplitterComponent"
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import Sidebar from "@/components/sidebar/Sidebar"
import WorkSpace from "@/components/workspace"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useFullScreen from "@/hooks/useFullScreen"
import useUserActivity from "@/hooks/useUserActivity"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS, User } from "@/types/user"
import { useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import TopNavbar from "@/components/navbar/TopNavbar"
import CopilotView from "@/components/sidebar/sidebar-views/CopilotView"
import { useViews } from "@/context/ViewContext"
import classNames from "classnames"

function EditorPage() {
    // Listen user online/offline status
    useUserActivity()
    // Enable fullscreen mode
    useFullScreen()
    const navigate = useNavigate()
    const { roomId } = useParams()
    const { status, setCurrentUser, currentUser } = useAppContext()
    const { socket } = useSocket()
    const location = useLocation()
    const { isAIOpen } = useViews()

    useEffect(() => {
        if (currentUser.username.length > 0) return
        const username = location.state?.username
        if (username === undefined) {
            navigate("/join", {
                state: { roomId },
            })
        } else if (roomId) {
            const user: User = { username, roomId }
            setCurrentUser(user)
            socket.emit(SocketEvent.JOIN_REQUEST, user)
        }
    }, [
        currentUser.username,
        location.state?.username,
        navigate,
        roomId,
        setCurrentUser,
        socket,
    ])

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-[#0a0a0a] relative">
            {/* High-Fidelity Ambient Background (Codient Style) */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#050505]/40 backdrop-blur-[2px] pointer-events-none" />
            
            <TopNavbar />
            <div className="flex h-[calc(100vh-3rem)] w-full overflow-hidden relative z-10">
                <SplitterComponent>
                    <Sidebar />
                    <WorkSpace/>
                    <div className={classNames(
                        "h-full px-[2px] pt-3 pb-3 bg-transparent transition-all duration-500",
                        isAIOpen ? "flex md:min-w-[310px]" : "hidden"
                    )}>
                        <div className="w-full flex-grow bg-[#0d0d0d] rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
                            <CopilotView />
                        </div>
                    </div>
                </SplitterComponent>
            </div>
        </div>
    )
}

export default EditorPage

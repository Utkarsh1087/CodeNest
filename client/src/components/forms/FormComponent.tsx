import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import logo from "@/assets/logo.svg"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining room...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        // Auto-fill roomId from navigation state (invite links)
        if (location.state?.roomId && !currentUser.roomId) {
            setCurrentUser(prev => ({ ...prev, roomId: location.state.roomId }))
            if (!currentUser.username) {
                toast.success("Ready to join workspace")
            }
        }
    }, [location.state?.roomId, currentUser.roomId, currentUser.username, setCurrentUser])

    useEffect(() => {
        // Ensure socket is connected when reaching the join page
        if (!socket.connected) {
            socket.connect()
        }

        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, navigate, setStatus, socket, status])

    return (
        <div className="glass-card flex w-full flex-col items-center justify-center gap-6 rounded-2xl p-8 sm:p-10">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Join Workspace</h2>
                <p className="text-white/50">Enter room ID and your alias to start</p>
            </div>
            <form onSubmit={joinRoom} className="flex w-full flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Room ID</label>
                    <input
                        type="text"
                        name="roomId"
                        placeholder="e.g. workspace-alpha-99"
                        className="glass-input w-full rounded-xl px-4 py-3.5 outline-none transition-all"
                        onChange={handleInputChanges}
                        value={currentUser.roomId}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Username</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="What should we call you?"
                        className="glass-input w-full rounded-xl px-4 py-3.5 outline-none transition-all"
                        onChange={handleInputChanges}
                        value={currentUser.username}
                        ref={usernameRef}
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] hover:shadow-white/20 active:scale-[0.98] shadow-lg shadow-primary/20"
                >
                    Launch Editor
                </button>
            </form>
            <div className="flex w-full items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-xs font-medium text-white/20">OR</span>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            <button
                className="group flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
                onClick={createNewRoomId}
            >
                <span className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary" />
                Generate unique room identity
            </button>
        </div>
    )
}

export default FormComponent

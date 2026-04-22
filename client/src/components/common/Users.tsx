import { useAppContext } from "@/context/AppContext"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import Avatar from "react-avatar"
import cn from "classnames"

function Users() {
    const { users } = useAppContext()

    return (
        <div className="flex flex-grow flex-col overflow-y-auto py-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {users.map((user) => (
                    <User key={user.socketId} user={user} />
                ))}
            </div>
        </div>
    )
}

const User = ({ user }: { user: RemoteUser }) => {
    const { username, status } = user
    const isOnline = status === USER_CONNECTION_STATUS.ONLINE
    
    return (
        <div 
            className="group relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10 hover:border-white/20 backdrop-blur-xl shadow-2xl"
        >
            <div className="relative mb-3">
                <Avatar 
                    name={username} 
                    size="44" 
                    round="12px" 
                    className="shadow-xl grayscale-[0.2] transition-all group-hover:grayscale-0 ring-4 ring-white/5" 
                />
                <div 
                    className={cn(
                        "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-black/80",
                        isOnline ? "bg-[#00d2ff] animate-pulse shadow-[0_0_10px_#00d2ff]" : "bg-danger shadow-[0_0_10px_#ff4d4d]"
                    )} 
                />
            </div>
            <p className="w-full truncate text-center text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                {username}
            </p>
            <span className={cn(
                "mt-1 text-[9px] font-black uppercase tracking-[0.3em]",
                isOnline ? "text-[#00d2ff]/60" : "text-danger/60"
            )}>
                {isOnline ? "Online" : "Offline"}
            </span>
        </div>
    )
}

export default Users

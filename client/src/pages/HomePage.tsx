import illustration from "@/assets/illustration.svg"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import logo from "@/assets/codenest1.png"

const heroBg = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070"

function HomePage() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div className="relative min-h-screen overflow-hidden bg-dark text-white">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 transition-transform duration-500 linear"
                style={{ 
                    backgroundImage: `url(${heroBg})`,
                    transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.01}px, ${(mousePos.y - window.innerHeight / 2) * 0.01}px) scale(1.1)`
                }}
            />
            
            {/* Gradient Overlay for Depth */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-dark via-dark/80 to-transparent" />

            {/* Interactive Glow */}
            <div 
                className="cursor-glow" 
                style={{ 
                    left: `${mousePos.x}px`, 
                    top: `${mousePos.y}px` 
                }} 
            />

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
                <div className="container mx-auto flex flex-col items-center justify-between gap-16 lg:flex-row">
                    {/* Hero Text Content */}
                    <div className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left lg:pl-16">
                        <img src={logo} alt="CodeNest Logo" className="-mt-12 mb-10 h-52" />
                        <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-8xl">
                            Code in <br />
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Real-time
                            </span>, <br />
                            Together.
                        </h1>
                        <p className="mb-10 max-w-lg text-xl text-white/50 leading-relaxed">
                            Experience the future of collaborative coding with CodeNest. 
                            The ultimate digital workspace for high-performance engineering teams.
                        </p>
                        
                        <Link 
                            to="/join"
                            className="group relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-primary to-secondary px-10 py-5 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-white/20 active:scale-95 shadow-2xl shadow-primary/20"
                        >
                            <span className="relative z-10 uppercase tracking-widest font-black">GET STARTED</span>
                            <div className="absolute inset-0 bg-white/20 transition-transform duration-300 -translate-x-full group-hover:translate-x-0" />
                        </Link>
                    </div>

                    {/* Floating Illustration on the Right */}
                    <div className="flex w-full items-center justify-center lg:w-1/2">
                        <div className="w-full max-w-2xl animate-float">
                            <img
                                src={illustration}
                                alt="CodeNest Illustration"
                                className="w-full grayscale-[0.1] drop-shadow-[0_20px_50px_rgba(57,224,121,0.2)]"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer Attribution */}
            <footer className="absolute bottom-6 left-0 right-0 z-10 text-center text-white/20 text-xs font-medium uppercase tracking-[0.2em]">
                &copy; 2024 CodeNest &bull; Powering the next generation of developers
            </footer>
        </div>
    )
}

export default HomePage

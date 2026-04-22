import FormComponent from "@/components/forms/FormComponent"
import { useEffect, useState } from "react"
import logo from "@/assets/codenest1.png"

const heroBg = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070"

function JoinPage() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div className="relative min-h-screen overflow-hidden bg-dark text-white flex items-center justify-center">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{ 
                    backgroundImage: `url(${heroBg})`,
                    transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.01}px, ${(mousePos.y - window.innerHeight / 2) * 0.01}px) scale(1.1)`
                }}
            />
            
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-dark via-dark/90 to-transparent" />

            {/* Interactive Glow */}
            <div 
                className="cursor-glow" 
                style={{ 
                    left: `${mousePos.x}px`, 
                    top: `${mousePos.y}px` 
                }} 
            />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="mb-1 flex justify-center">
                    <img src={logo} alt="CodeNest Logo" className="h-40" />
                </div>
                <FormComponent />
            </div>
        </div>
    )
}

export default JoinPage

import axios, { AxiosInstance } from "axios"

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:3000"

const instance: AxiosInstance = axios.create({
    baseURL: backendBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
})

// Optional: Add a simple health check to verify connectivity
export const checkHealth = () => instance.get("/api/health")

export default instance

// import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import AppProvider from "./context/AppProvider.tsx"
import { BrowserRouter as Router } from "react-router-dom"
import "@/styles/global.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <Router>
        <AppProvider>
            <App />
        </AppProvider>
    </Router>
)

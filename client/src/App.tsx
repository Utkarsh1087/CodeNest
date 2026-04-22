import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Toast from "./components/toast/Toast"
import EditorPage from "./pages/EditorPage"
import HomePage from "./pages/HomePage"
import JoinPage from "./pages/JoinPage"

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/join" element={<JoinPage />} />
                <Route path="/editor/:roomId" element={<EditorPage />} />
            </Routes>
            <Toast /> {/* Toast component from react-hot-toast */}
        </>
    )
}

export default App

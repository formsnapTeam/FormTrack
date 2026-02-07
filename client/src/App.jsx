import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import CustomCursor from './components/CustomCursor'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import ApplicationDetail from './pages/ApplicationDetail'
import Analytics from './pages/Analytics'
import './styles/index.css'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="app">
                        {/* Background Effects */}
                        <div className="bg-grid" />
                        <div className="bg-glow" />

                        {/* Custom Cursor */}
                        <CustomCursor />

                        <Navbar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                <Route path="/dashboard" element={
                                    <PrivateRoute><Dashboard /></PrivateRoute>
                                } />
                                <Route path="/application/:id" element={
                                    <PrivateRoute><ApplicationDetail /></PrivateRoute>
                                } />
                                <Route path="/analytics" element={
                                    <PrivateRoute><Analytics /></PrivateRoute>
                                } />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App

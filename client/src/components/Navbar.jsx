import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Navbar.css'

const Navbar = () => {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Left: Logo */}
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="4" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    <span className="brand-text">
                        Form<span className="accent">Snap</span>
                    </span>
                </Link>

                {/* Center: Navigation Links (when logged in) */}
                {user && (
                    <div className="navbar-center">
                        <Link
                            to="/dashboard"
                            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/analytics"
                            className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20V10M18 20V4M6 20v-4" />
                            </svg>
                            <span>Analytics</span>
                        </Link>
                    </div>
                )}

                {/* Right: Actions */}
                <div className="navbar-right">
                    {/* Theme Toggle */}
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                        )}
                    </button>

                    {user ? (
                        <>
                            {/* User Menu */}
                            <div className="user-menu">
                                <div className="user-avatar">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="user-name">{user.name}</span>
                            </div>
                            <button onClick={handleLogout} className="btn-logout">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/register" className="btn-text">
                                Get Started
                            </Link>
                            <Link to="/login" className="btn-login-primary">
                                Login
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar

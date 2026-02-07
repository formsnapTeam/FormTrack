import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState({ message: '', code: '' })
    const [loading, setLoading] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetSent, setResetSent] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError({ message: '', code: '' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError({ message: '', code: '' })

        const result = await login(formData.email, formData.password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setError({
                message: result.error,
                code: result.code || ''
            })
        }
        setLoading(false)
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            })
            const data = await res.json()

            if (data.success) {
                setResetSent(true)
                setTimeout(() => {
                    setShowForgotPassword(false)
                    setResetSent(false)
                    setResetEmail('')
                }, 4000)
            } else {
                setError({ message: data.message, code: '' })
            }
        } catch (err) {
            setError({ message: 'Failed to send reset email', code: '' })
        } finally {
            setLoading(false)
        }
    }

    const getErrorDisplay = () => {
        if (error.code === 'USER_NOT_FOUND') {
            return {
                title: 'Account Not Found',
                message: 'No account is registered with this email address.',
                showRegister: true
            }
        }
        if (error.code === 'WRONG_PASSWORD') {
            return {
                title: 'Incorrect Password',
                message: 'The password you entered is incorrect.',
                showForgot: true
            }
        }
        return {
            title: 'Error',
            message: error.message,
            showRegister: false
        }
    }

    const errorDisplay = error.message ? getErrorDisplay() : null

    return (
        <div className="auth-page page">
            {/* Premium Background Graphics */}
            <div className="auth-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <div className="grid-pattern"></div>
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                </div>
            </div>

            <div className="auth-container">
                {/* Forgot Password Modal */}
                {showForgotPassword && (
                    <div className="forgot-modal animate-scaleIn">
                        <div className="forgot-card card">
                            <button
                                className="forgot-close"
                                onClick={() => setShowForgotPassword(false)}
                            >
                                ✕
                            </button>
                            <div className="forgot-header">
                                <div className="modal-icon-circle">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <h3>Reset Password</h3>
                                <p>Enter your email to receive a reset link</p>
                            </div>
                            {resetSent ? (
                                <div className="reset-success animate-scaleIn">
                                    <div className="success-check">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <p>Reset link sent! Check your email.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotPassword}>
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="your@email.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                <div className="auth-card card animate-morphIn">
                    {/* Logo & Header */}
                    <div className="auth-header">
                        <div className="auth-logo">
                            <div className="logo-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2">
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                            </div>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to continue tracking your applications</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {errorDisplay && (
                            <div className={`error-card animate-shakeIn ${error.code === 'USER_NOT_FOUND' ? 'warning' : 'error'}`}>
                                <div className="error-content">
                                    <span className="error-title">{errorDisplay.title}</span>
                                    <p className="error-message-text">{errorDisplay.message}</p>
                                </div>
                                {errorDisplay.showRegister && (
                                    <Link to="/register" className="error-action">
                                        Create account →
                                    </Link>
                                )}
                                {errorDisplay.showForgot && (
                                    <button
                                        type="button"
                                        className="error-action"
                                        onClick={() => setShowForgotPassword(true)}
                                    >
                                        Reset password →
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="forgot-link"
                                onClick={() => setShowForgotPassword(true)}
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="btn-loading">
                                    <span className="loading-spinner"></span>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account?
                        <Link to="/register">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login

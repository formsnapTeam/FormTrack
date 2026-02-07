import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Auth.css'

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const { setUser } = useAuth()

    const [status, setStatus] = useState('verifying') // verifying, valid, invalid, success, error
    const [maskedEmail, setMaskedEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Password validation
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    const isPasswordValid = Object.values(passwordChecks).every(Boolean)
    const passwordsMatch = password === confirmPassword && password.length > 0

    useEffect(() => {
        verifyToken()
    }, [token])

    const verifyToken = async () => {
        try {
            const res = await api.get(`/auth/verify-reset-token/${token}`)
            if (res.data.valid) {
                setStatus('valid')
                setMaskedEmail(res.data.email)
            } else {
                setStatus('invalid')
            }
        } catch (err) {
            setStatus('invalid')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isPasswordValid) {
            setError('Please meet all password requirements')
            return
        }

        if (!passwordsMatch) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await api.post(`/auth/reset-password/${token}`, { password })

            if (res.data.success) {
                // Auto-login user
                localStorage.setItem('token', res.data.token)
                api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
                setUser(res.data.user)
                setStatus('success')

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    navigate('/dashboard')
                }, 2000)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password')
            if (err.response?.status === 400) {
                setStatus('invalid')
            }
        } finally {
            setLoading(false)
        }
    }

    // Verifying state
    if (status === 'verifying') {
        return (
            <div className="auth-page page">
                <div className="auth-bg">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                </div>
                <div className="auth-container">
                    <div className="auth-card card">
                        <div className="reset-loading">
                            <div className="spinner"></div>
                            <p>Verifying reset link...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Invalid/Expired token
    if (status === 'invalid') {
        return (
            <div className="auth-page page">
                <div className="auth-bg">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                </div>
                <div className="auth-container">
                    <div className="auth-card card animate-morphIn">
                        <div className="auth-header">
                            <div className="auth-icon-wrapper error">
                                <span className="auth-icon">❌</span>
                            </div>
                            <h1>Link Expired</h1>
                            <p>This password reset link is invalid or has expired.</p>
                        </div>
                        <div className="reset-actions">
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Back to Login
                            </Link>
                            <p className="reset-hint">
                                Need a new link? Use "Forgot Password" on the login page.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="auth-page page">
                <div className="auth-bg">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                </div>
                <div className="auth-container">
                    <div className="auth-card card animate-morphIn">
                        <div className="auth-header">
                            <div className="auth-icon-wrapper success">
                                <span className="auth-icon">✅</span>
                            </div>
                            <h1>Password Reset!</h1>
                            <p>Your password has been successfully changed.</p>
                        </div>
                        <div className="reset-success-message">
                            <div className="spinner"></div>
                            <p>Redirecting to dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Valid token - show reset form
    return (
        <div className="auth-page page">
            <div className="auth-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="auth-container">
                <div className="auth-card card animate-morphIn">
                    <div className="auth-header">
                        <div className="auth-icon-wrapper">
                            <span className="auth-icon">🔐</span>
                            <div className="icon-ring"></div>
                        </div>
                        <h1>Create New Password</h1>
                        <p>Enter a new password for <strong>{maskedEmail}</strong></p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-card error animate-shakeIn">
                                <div className="error-header">
                                    <span className="error-icon">⚠️</span>
                                    <span className="error-title">Error</span>
                                </div>
                                <p className="error-message-text">{error}</p>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    className="form-input with-icon"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="password-constraints">
                            <div className={`constraint ${passwordChecks.length ? 'valid' : ''}`}>
                                <span className="constraint-icon">{passwordChecks.length ? '✓' : '○'}</span>
                                At least 8 characters
                            </div>
                            <div className={`constraint ${passwordChecks.uppercase ? 'valid' : ''}`}>
                                <span className="constraint-icon">{passwordChecks.uppercase ? '✓' : '○'}</span>
                                One uppercase letter
                            </div>
                            <div className={`constraint ${passwordChecks.lowercase ? 'valid' : ''}`}>
                                <span className="constraint-icon">{passwordChecks.lowercase ? '✓' : '○'}</span>
                                One lowercase letter
                            </div>
                            <div className={`constraint ${passwordChecks.number ? 'valid' : ''}`}>
                                <span className="constraint-icon">{passwordChecks.number ? '✓' : '○'}</span>
                                One number
                            </div>
                            <div className={`constraint ${passwordChecks.special ? 'valid' : ''}`}>
                                <span className="constraint-icon">{passwordChecks.special ? '✓' : '○'}</span>
                                One special character
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    className={`form-input with-icon ${confirmPassword && !passwordsMatch ? 'error' : ''}`}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <span className="field-error">Passwords do not match</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading || !isPasswordValid || !passwordsMatch}
                        >
                            {loading ? (
                                <span className="btn-loading">
                                    <span className="loading-spinner"></span>
                                    Resetting...
                                </span>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Remember your password?
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword

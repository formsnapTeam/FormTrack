import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    // Password validation
    const passwordChecks = useMemo(() => ({
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    }), [formData.password])

    const isPasswordValid = Object.values(passwordChecks).filter(Boolean).length >= 4

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isPasswordValid) {
            setError("Password doesn't meet the requirements")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match")
            return
        }

        setLoading(true)
        setError('')

        const result = await register(formData.name, formData.email, formData.password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setError(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="auth-page page">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="auth-container">
                <div className="auth-card card animate-morphIn">
                    <div className="auth-header">
                        <h1>Create Account</h1>
                        <p>Start tracking your placement applications</p>
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
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

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
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setPasswordFocused(true)}
                                required
                            />

                            {/* Password Constraints */}
                            {(passwordFocused || formData.password) && (
                                <div className="password-constraints animate-slideDown">
                                    <p className="constraints-title">Password must contain:</p>
                                    <div className="constraints-grid">
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
                                    <div className="password-strength">
                                        <div className="strength-bar">
                                            <div
                                                className={`strength-fill strength-${Object.values(passwordChecks).filter(Boolean).length}`}
                                            />
                                        </div>
                                        <span className="strength-text">
                                            {Object.values(passwordChecks).filter(Boolean).length <= 2 ? 'Weak' :
                                                Object.values(passwordChecks).filter(Boolean).length <= 3 ? 'Fair' :
                                                    Object.values(passwordChecks).filter(Boolean).length <= 4 ? 'Good' : 'Strong'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className={`form-input ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'input-error' : ''}`}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="field-error">Passwords don't match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading || !isPasswordValid}
                        >
                            {loading ? (
                                <span className="btn-loading">
                                    <span className="loading-spinner"></span>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account?
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register

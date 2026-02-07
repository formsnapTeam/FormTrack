import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef } from 'react'
import './Home.css'

const Home = () => {
    const { user } = useAuth()
    const canvasRef = useRef(null)

    // Premium Mesh Gradient Background
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        let animationId
        let time = 0

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        const draw = () => {
            time += 0.002
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
            const width = canvas.width
            const height = canvas.height

            // Clear canvas
            ctx.fillStyle = isDark ? '#030014' : '#ffffff'
            ctx.fillRect(0, 0, width, height)

            // Mesh Gradient Blobs
            const blobs = [
                {
                    x: Math.sin(time) * 0.2 + 0.3,
                    y: Math.cos(time * 0.8) * 0.2 + 0.3,
                    r: 0.8,
                    color: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(99, 102, 241, 0.08)' // Indigo
                },
                {
                    x: Math.cos(time * 0.7) * 0.2 + 0.7,
                    y: Math.sin(time * 0.6) * 0.2 + 0.3,
                    r: 0.9,
                    color: isDark ? 'rgba(124, 58, 237, 0.12)' : 'rgba(139, 92, 246, 0.06)' // Violet
                },
                {
                    x: Math.sin(time * 0.9) * 0.2 + 0.5,
                    y: Math.cos(time * 0.5) * 0.2 + 0.7,
                    r: 0.8,
                    color: isDark ? 'rgba(14, 165, 233, 0.12)' : 'rgba(56, 189, 248, 0.06)' // Sky
                }
            ]

            blobs.forEach(blob => {
                const x = blob.x * width
                const y = blob.y * height
                const radius = Math.min(width, height) * blob.r

                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
                gradient.addColorStop(0, blob.color)
                gradient.addColorStop(1, 'transparent')

                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(x, y, radius, 0, Math.PI * 2)
                ctx.fill()
            })

            animationId = requestAnimationFrame(draw)
        }

        resize()
        draw()
        window.addEventListener('resize', resize)

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationId)
        }
    }, [])

    const features = [
        {
            icon: '⚡',
            title: 'One-Click Capture',
            desc: 'Save job forms instantly with our browser bookmarklet. No manual entry.'
        },
        {
            icon: '📊',
            title: 'Visual Tracking',
            desc: 'See all applications in a clean dashboard with status updates.'
        },
        {
            icon: '🔔',
            title: 'Smart Reminders',
            desc: 'Never miss deadlines with intelligent follow-up notifications.'
        },
        {
            icon: '📈',
            title: 'Analytics',
            desc: 'Track your success rate and optimize your job search strategy.'
        }
    ]

    return (
        <div className="home">
            {/* Animated Canvas Background */}
            <canvas ref={canvasRef} className="bg-canvas" />



            {/* Hero Section - 2 Column Layout */}
            <section className="hero">
                <div className="container">
                    <div className="hero-grid">
                        {/* Left: Content */}
                        <div className="hero-content">
                            <h1 className="hero-title">
                                Track Your Path to <br />
                                <span className="gradient-text">Your Dream Career</span>
                            </h1>

                            <p className="hero-desc">
                                The smart way to organize your job search. Capture applications
                                instantly, track progress visually, and never miss an opportunity.
                            </p>

                            <div className="hero-buttons">
                                {user ? (
                                    <Link to="/dashboard" className="btn btn-primary">
                                        Open Dashboard
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/register" className="btn btn-primary">
                                            Get Started Free
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                        <Link to="/login" className="btn btn-secondary">
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Stats Row */}
                            <div className="hero-stats">
                                <div className="hero-stat">
                                    <span className="hero-stat-value">10K+</span>
                                    <span className="hero-stat-label">Applications</span>
                                </div>
                                <div className="hero-stat">
                                    <span className="hero-stat-value">2.5K</span>
                                    <span className="hero-stat-label">Users</span>
                                </div>
                                <div className="hero-stat">
                                    <span className="hero-stat-value">94%</span>
                                    <span className="hero-stat-label">Success</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Dashboard Preview */}
                        <div className="hero-preview">
                            <div className="preview-card">
                                <div className="preview-header">
                                    <div className="window-controls">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <span className="preview-title">FormSnap Dashboard</span>
                                </div>
                                <div className="preview-body">
                                    <div className="mini-stats">
                                        <div className="mini-stat">
                                            <span className="mini-stat-value">12</span>
                                            <span className="mini-stat-label">Active</span>
                                        </div>
                                        <div className="mini-stat purple">
                                            <span className="mini-stat-value">5</span>
                                            <span className="mini-stat-label">Interviews</span>
                                        </div>
                                        <div className="mini-stat green">
                                            <span className="mini-stat-value">3</span>
                                            <span className="mini-stat-label">Offers</span>
                                        </div>
                                    </div>
                                    <div className="app-list">
                                        <div className="app-item">
                                            <div className="app-logo" style={{ background: '#4285f4' }}>G</div>
                                            <div className="app-info">
                                                <span className="app-company">Google</span>
                                                <span className="app-role">Software Engineer</span>
                                            </div>
                                            <span className="app-status interview">Interview</span>
                                        </div>
                                        <div className="app-item">
                                            <div className="app-logo" style={{ background: '#0668e1' }}>M</div>
                                            <div className="app-info">
                                                <span className="app-company">Microsoft</span>
                                                <span className="app-role">SDE Intern</span>
                                            </div>
                                            <span className="app-status pending">Pending</span>
                                        </div>
                                        <div className="app-item highlight">
                                            <div className="app-logo" style={{ background: '#ff9900' }}>A</div>
                                            <div className="app-info">
                                                <span className="app-company">Amazon</span>
                                                <span className="app-role">SDE-1</span>
                                            </div>
                                            <span className="app-status offer">Offer 🎉</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Features</span>
                        <h2 className="section-title">Everything you need to succeed</h2>
                        <p className="section-desc">Powerful tools to organize and optimize your job search.</p>
                    </div>

                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon">{f.icon}</div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">10K+</span>
                            <span className="stat-label">Applications Tracked</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">2.5K</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">94%</span>
                            <span className="stat-label">Success Rate</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">50+</span>
                            <span className="stat-label">Universities</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-box">
                        <h2 className="cta-title">Ready to organize your job search?</h2>
                        <p className="cta-desc">Join thousands of students tracking their path to success.</p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Start Tracking Free
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="footer-logo">Form<span className="accent">Snap</span></span>
                            <p>Track your path to success.</p>
                        </div>
                        <div className="footer-links">
                            <a href="#">About</a>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© {new Date().getFullYear()} FormSnap. Built with ❤️ for students.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home

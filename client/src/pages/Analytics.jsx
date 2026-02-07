import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { GeneralIcon } from '../components/Icons'
import './Analytics.css'

const Analytics = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/applications/analytics')
            setStats(res.data)
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        const icons = {
            Applied: '📝',
            Test: '📋',
            Interview: '💼',
            Shortlisted: '⭐',
            Offer: '🎉',
            Rejected: '❌'
        }
        return icons[status] || '📄'
    }

    const getTagIcon = (tag) => {
        const icons = {
            Dream: '🌟',
            Backup: '🔄',
            'Off-campus': '🏢',
            PPO: '💼',
            Internship: '🎓'
        }
        return icons[tag] || '🏷️'
    }

    if (loading) {
        return (
            <div className="analytics-page page">
                <div className="container">
                    <div className="dashboard-loading">
                        <div className="spinner" />
                        <p>Loading analytics...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!stats || stats.total === 0) {
        return (
            <div className="analytics-page page">
                <div className="container">
                    <div className="analytics-empty card">
                        <div className="analytics-empty-icon">📊</div>
                        <h3>No data yet</h3>
                        <p>Start tracking applications to see your analytics</p>
                        <Link to="/dashboard" className="btn btn-primary">
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const successRate = stats.total > 0
        ? Math.round(((stats.byStatus.Offer || 0) / stats.total) * 100)
        : 0

    const activeCount = stats.total - (stats.byStatus.Rejected || 0) - (stats.byStatus.Offer || 0)

    return (
        <div className="analytics-page page">
            <div className="container">
                <div className="analytics-header">
                    <h1>📈 Analytics</h1>
                    <p className="text-muted">Track your placement journey progress</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card card">
                        <div className="stat-icon blue">📋</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Applications</div>
                        </div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon cyan">
                            <GeneralIcon className="stat-svg-icon" />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.byCategory?.Form || 0}</div>
                            <div className="stat-label">General Forms</div>
                        </div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon purple">⚡</div>
                        <div className="stat-content">
                            <div className="stat-value">{activeCount}</div>
                            <div className="stat-label">Active</div>
                        </div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon green">🎉</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.byStatus.Offer || 0}</div>
                            <div className="stat-label">Offers Received</div>
                        </div>
                    </div>

                    <div className="stat-card card">
                        <div className="stat-icon orange">📊</div>
                        <div className="stat-content">
                            <div className="stat-value">{successRate}%</div>
                            <div className="stat-label">Success Rate</div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-grid">
                    {/* Status Distribution */}
                    <div className="chart-card card">
                        <div className="card-header">
                            <h3 className="chart-title">Status Distribution</h3>
                        </div>
                        <div className="chart-container">
                            <div className="status-bars">
                                {['Applied', 'Test', 'Interview', 'Shortlisted', 'Offer', 'Rejected'].map(status => {
                                    const count = stats.byStatus[status] || 0
                                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0

                                    return (
                                        <div key={status} className="status-bar-item">
                                            <div className="status-bar-header">
                                                <span className="status-bar-name">
                                                    {getStatusIcon(status)} {status}
                                                </span>
                                                <span className="status-bar-count">{count}</span>
                                            </div>
                                            <div className="status-bar-track">
                                                <div
                                                    className={`status-bar-fill ${status.toLowerCase()}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Tags Distribution */}
                    <div className="chart-card card">
                        <div className="card-header">
                            <h3 className="chart-title">Tags Overview</h3>
                        </div>
                        <div className="chart-container">
                            <div className="tags-chart">
                                {Object.entries(stats.byTag).length > 0 ? (
                                    Object.entries(stats.byTag).map(([tag, count]) => (
                                        <div key={tag} className="tag-item">
                                            <span className="tag-icon">{getTagIcon(tag)}</span>
                                            <span className="tag-name">{tag}</span>
                                            <span className="tag-count">({count})</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted">No tags added yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics

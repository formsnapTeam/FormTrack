import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import AddApplicationModal from '../components/AddApplicationModal'
import './Dashboard.css'

const STATUS_OPTIONS = ['Applied', 'Test', 'Interview', 'Shortlisted', 'Offer', 'Rejected']

const Dashboard = () => {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showBookmarklet, setShowBookmarklet] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        try {
            const res = await api.get('/applications')
            setApplications(res.data)
        } catch (error) {
            console.error('Failed to fetch applications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/applications/${id}`, { status: newStatus })
            setApplications(apps =>
                apps.map(app => app._id === id ? { ...app, status: newStatus } : app)
            )
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this application?')) return

        try {
            await api.delete(`/applications/${id}`)
            setApplications(apps => apps.filter(app => app._id !== id))
        } catch (error) {
            console.error('Failed to delete application:', error)
        }
    }

    const handleAdd = async (formData) => {
        const res = await api.post('/applications', formData)
        setApplications(prev => [res.data, ...prev])
    }

    // CSV Export
    const handleExportCSV = () => {
        const headers = ['Company', 'Form Title', 'Status', 'Date Applied', 'Deadline', 'Notes', 'Tags']
        const rows = filteredApplications.map(app => [
            app.company || '',
            app.formTitle,
            app.status,
            formatDate(app.createdAt),
            app.deadline ? formatDate(app.deadline) : '',
            (app.notes || '').replace(/"/g, '""'),
            (app.tags || []).join(', ')
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `formsnap-applications-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    // Deadline helper functions
    const getDeadlineStatus = (deadline) => {
        if (!deadline) return null
        const now = new Date()
        const deadlineDate = new Date(deadline)
        const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))

        if (daysUntil < 0) return 'passed'
        if (daysUntil === 0) return 'today'
        if (daysUntil <= 2) return 'urgent'
        if (daysUntil <= 5) return 'warning'
        if (daysUntil <= 7) return 'soon'
        return 'normal'
    }

    const getDeadlineLabel = (deadline) => {
        if (!deadline) return null
        const now = new Date()
        const deadlineDate = new Date(deadline)
        const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))

        if (daysUntil < 0) return 'Passed'
        if (daysUntil === 0) return 'Today!'
        if (daysUntil === 1) return 'Tomorrow'
        if (daysUntil <= 7) return `${daysUntil} days`
        return null
    }

    // Count upcoming deadlines
    const upcomingDeadlines = applications.filter(app => {
        if (!app.deadline) return false
        const status = getDeadlineStatus(app.deadline)
        return ['today', 'urgent', 'warning'].includes(status)
    }).length

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.formTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.company?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = !statusFilter || app.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getBookmarkletCode = () => {
        const token = localStorage.getItem('token')
        const apiUrl = 'http://localhost:5001/api'
        return `javascript:(function(){
      var title=document.title;
      var url=window.location.href;
      fetch('${apiUrl}/applications/bookmarklet',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer ${token}'},
        body:JSON.stringify({formTitle:title,formUrl:url})
      }).then(r=>r.json()).then(d=>{
        alert(d.success?'✅ Saved: '+title:'❌ Error: '+d.message);
      }).catch(e=>alert('❌ Failed to save'));
    })();`
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading applications...</p>
            </div>
        )
    }

    return (
        <div className="dashboard-page page">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>My Applications</h1>
                        <p className="text-muted">{applications.length} applications tracked</p>
                    </div>
                    <div className="header-buttons">
                        <button className="btn btn-secondary" onClick={handleExportCSV}>
                            📥 Export CSV
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowBookmarklet(true)}
                        >
                            ⚡ Bookmarklet
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            ➕ Add Application
                        </button>
                    </div>
                </div>

                {/* Deadline Alert Banner */}
                {upcomingDeadlines > 0 && (
                    <div className="deadline-banner">
                        <span className="deadline-icon">⏰</span>
                        <span>
                            <strong>{upcomingDeadlines}</strong> deadline{upcomingDeadlines > 1 ? 's' : ''} coming up soon!
                        </span>
                    </div>
                )}

                {/* Add Application Modal */}
                <AddApplicationModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAdd}
                />

                {/* Bookmarklet Modal */}
                {showBookmarklet && (
                    <div className="modal-overlay" onClick={() => setShowBookmarklet(false)}>
                        <div className="modal card" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>One-Click Bookmarklet</h3>
                                <button className="modal-close" onClick={() => setShowBookmarklet(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p>Drag this button to your bookmarks bar:</p>
                                <a
                                    href={getBookmarkletCode()}
                                    className="bookmarklet-btn"
                                    onClick={e => e.preventDefault()}
                                >
                                    📸 Save to FormSnap
                                </a>
                                <div className="bookmarklet-instructions">
                                    <h4>How to use:</h4>
                                    <ol>
                                        <li>Drag the button above to your bookmarks bar</li>
                                        <li>Visit any Google Form after submitting</li>
                                        <li>Click the bookmarklet to save the form</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="dashboard-filters">
                    <input
                        type="text"
                        className="form-input search-input"
                        placeholder="🔍 Search by company or form name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="form-select status-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Applications Table */}
                {filteredApplications.length === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-icon">📋</div>
                        <h3>No applications yet</h3>
                        <p>Use the bookmarklet to save your first Google Form!</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Company / Form</th>
                                    <th>Status</th>
                                    <th>Date Applied</th>
                                    <th>Deadline</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map(app => {
                                    const deadlineStatus = getDeadlineStatus(app.deadline)
                                    const deadlineLabel = getDeadlineLabel(app.deadline)

                                    return (
                                        <tr key={app._id} className={`animate-fadeIn ${deadlineStatus === 'today' || deadlineStatus === 'urgent' ? 'row-urgent' : ''}`}>
                                            <td>
                                                <div className="app-info">
                                                    <span className="app-title">{app.formTitle}</span>
                                                    {app.company && <span className="app-company">{app.company}</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <select
                                                    className={`status-badge badge-${app.status.toLowerCase()}`}
                                                    value={app.status}
                                                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                >
                                                    {STATUS_OPTIONS.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="text-muted">{formatDate(app.createdAt)}</td>
                                            <td>
                                                {app.deadline ? (
                                                    <div className={`deadline-cell deadline-${deadlineStatus}`}>
                                                        <span className="deadline-date">{formatDate(app.deadline)}</span>
                                                        {deadlineLabel && (
                                                            <span className="deadline-label">{deadlineLabel}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <Link to={`/application/${app._id}`} className="btn btn-secondary btn-sm">
                                                        View
                                                    </Link>
                                                    <a
                                                        href={app.formUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-secondary btn-sm"
                                                    >
                                                        Open
                                                    </a>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(app._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard

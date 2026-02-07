import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { PlacementIcon, GeneralIcon } from '../components/Icons'
import './ApplicationDetail.css'

const PLACEMENT_STATUSES = ['Applied', 'Test', 'Interview', 'Shortlisted', 'Offer', 'Rejected']
const FORM_STATUSES = ['Submitted', 'To Do', 'In Progress', 'Done']
const TAG_OPTIONS = ['Dream', 'Backup', 'Off-campus', 'PPO', 'Internship']

const ApplicationDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [application, setApplication] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({})

    useEffect(() => {
        fetchApplication()
    }, [id])

    const fetchApplication = async () => {
        try {
            const res = await api.get(`/applications/${id}`)
            setApplication(res.data)
            setFormData(res.data)
        } catch (error) {
            console.error('Failed to fetch application:', error)
            navigate('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleTagToggle = (tag) => {
        const currentTags = formData.tags || []
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag]
        setFormData(prev => ({ ...prev, tags: newTags }))
    }

    const handleSave = async () => {
        try {
            const res = await api.patch(`/applications/${id}`, formData)
            setApplication(res.data)
            setEditing(false)
        } catch (error) {
            console.error('Failed to update application:', error)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this application?')) return

        try {
            await api.delete(`/applications/${id}`)
            navigate('/dashboard')
        } catch (error) {
            console.error('Failed to delete application:', error)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="detail-loading">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!application) return null

    return (
        <div className="detail-page page">
            <div className="container">
                <div className="detail-nav">
                    <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
                </div>

                <div className="detail-header">
                    <div>
                        <h1>{application.formTitle}</h1>
                        {application.company && <p className="company-name">{application.company}</p>}
                    </div>
                    <div className="header-actions">
                        {editing ? (
                            <>
                                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                                <button className="btn btn-secondary" onClick={() => {
                                    setFormData(application)
                                    setEditing(false)
                                }}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit</button>
                                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="detail-grid">
                    {/* Main Info */}
                    <div className="detail-card card">
                        <div className="card-header">
                            <h3>Application Details</h3>
                        </div>
                        <div className="card-body">
                            <div className="detail-row">
                                <label>Category</label>
                                {editing ? (
                                    <select
                                        name="category"
                                        className="form-select"
                                        value={formData.category || 'Placement'}
                                        onChange={(e) => {
                                            const newCategory = e.target.value
                                            setFormData(prev => ({
                                                ...prev,
                                                category: newCategory,
                                                status: newCategory === 'Placement' ? 'Applied' : 'Submitted'
                                            }))
                                        }}
                                    >
                                        <option value="Placement">Placement</option>
                                        <option value="Form">General Form</option>
                                    </select>
                                ) : (
                                    <span className={`category-badge ${application.category === 'Form' ? 'cat-form' : 'cat-placement'}`}>
                                        {application.category === 'Form' ? <GeneralIcon className="badge-icon" /> : <PlacementIcon className="badge-icon" />}
                                        {application.category === 'Form' ? 'General' : 'Placement'}
                                    </span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>Status</label>
                                {editing ? (
                                    <select
                                        name="status"
                                        className="form-select"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        {(formData.category === 'Form' ? FORM_STATUSES : PLACEMENT_STATUSES).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className={`badge badge-${application.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {application.status}
                                    </span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>{(editing ? formData.category : application.category) === 'Placement' ? 'Company' : 'Organization'}</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        name="company"
                                        className="form-input"
                                        value={formData.company || ''}
                                        onChange={handleChange}
                                        placeholder={(formData.category === 'Placement' ? "Enter company name" : "Enter organization/context")}
                                    />
                                ) : (
                                    <span>{application.company || '-'}</span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>Form URL</label>
                                <a href={application.formUrl} target="_blank" rel="noopener noreferrer" className="form-link">
                                    {application.formUrl}
                                </a>
                            </div>

                            <div className="detail-row">
                                <label>Deadline</label>
                                {editing ? (
                                    <input
                                        type="date"
                                        name="deadline"
                                        className="form-input"
                                        value={formData.deadline ? formData.deadline.split('T')[0] : ''}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <span>{formatDate(application.deadline)}</span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>Applied On</label>
                                <span>{formatDate(application.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="detail-card card">
                        <div className="card-header">
                            <h3>Tags</h3>
                        </div>
                        <div className="card-body">
                            <div className="tags-container">
                                {TAG_OPTIONS.map(tag => (
                                    <button
                                        key={tag}
                                        className={`tag-btn ${(formData.tags || []).includes(tag) ? 'active' : ''}`}
                                        onClick={() => editing && handleTagToggle(tag)}
                                        disabled={!editing}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="detail-card card notes-card">
                        <div className="card-header">
                            <h3>Notes</h3>
                        </div>
                        <div className="card-body">
                            {editing ? (
                                <textarea
                                    name="notes"
                                    className="form-input notes-input"
                                    value={formData.notes || ''}
                                    onChange={handleChange}
                                    placeholder="Add notes about this application (test dates, interview feedback, reminders...)"
                                />
                            ) : (
                                <p className="notes-text">{application.notes || 'No notes added yet.'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApplicationDetail

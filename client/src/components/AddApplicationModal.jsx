import { useState } from 'react'
import './AddApplicationModal.css'

const STATUS_OPTIONS = ['Applied', 'Test', 'Interview', 'Shortlisted', 'Offer', 'Rejected']

const AddApplicationModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        formTitle: '',
        formUrl: '',
        company: '',
        status: 'Applied',
        deadline: '',
        notes: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.formTitle.trim()) {
            setError('Form title is required')
            return
        }
        if (!formData.formUrl.trim()) {
            setError('Form URL is required')
            return
        }

        setLoading(true)
        try {
            await onAdd(formData)
            setFormData({
                formTitle: '',
                formUrl: '',
                company: '',
                status: 'Applied',
                deadline: '',
                notes: ''
            })
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add application')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal add-modal card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>➕ Add Application</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Form Title *</label>
                        <input
                            type="text"
                            name="formTitle"
                            className="form-input"
                            placeholder="e.g., Google SDE Application Form"
                            value={formData.formTitle}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Form URL *</label>
                        <input
                            type="url"
                            name="formUrl"
                            className="form-input"
                            placeholder="https://forms.google.com/..."
                            value={formData.formUrl}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Company</label>
                            <input
                                type="text"
                                name="company"
                                className="form-input"
                                placeholder="e.g., Google"
                                value={formData.company}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            className="form-input"
                            value={formData.deadline}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            name="notes"
                            className="form-input"
                            placeholder="Add any notes..."
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddApplicationModal

import './StatusProgress.css'

const STAGES = [
    { key: 'Applied', icon: '📝', label: 'Applied' },
    { key: 'Test', icon: '📋', label: 'Test' },
    { key: 'Interview', icon: '💼', label: 'Interview' },
    { key: 'Shortlisted', icon: '⭐', label: 'Shortlisted' },
    { key: 'Offer', icon: '🎉', label: 'Offer' }
]

const StatusProgress = ({ currentStatus, onStatusChange, compact = false }) => {
    const isRejected = currentStatus === 'Rejected'
    const currentIndex = STAGES.findIndex(s => s.key === currentStatus)

    const getStepClass = (index, stageKey) => {
        if (isRejected) {
            return 'rejected'
        }
        if (index < currentIndex) {
            return 'completed'
        }
        if (index === currentIndex) {
            return 'current'
        }
        return ''
    }

    return (
        <div className={`status-progress ${compact ? 'compact' : ''}`}>
            <div className="progress-pipeline" data-status={currentStatus}>
                {STAGES.map((stage, index) => (
                    <div
                        key={stage.key}
                        className={`progress-step ${getStepClass(index, stage.key)}`}
                        onClick={() => onStatusChange && onStatusChange(stage.key)}
                        title={stage.label}
                    >
                        <div className="step-circle">
                            {isRejected ? '✕' : stage.icon}
                        </div>
                        <span className="step-label">{stage.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StatusProgress

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { questionStore, classroomStore, submissionStore } from '../store/mockStore'

export default function AnalyticsPage() {
  const { id: classroomId, qid } = useParams()
  const navigate = useNavigate()

  const classroom = classroomStore.byId(classroomId)
  const question = questionStore.byId(qid)
  const submissions = submissionStore.forQuestion(qid)

  const diffColors = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }

  if (!question) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            <div style={{ fontWeight: 600 }}>Question not found</div>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate(`/teacher/classroom/${classroomId}`)}>
              Back to Classroom
            </button>
          </div>
        </main>
      </div>
    )
  }

  const uniqueStudents = [...new Set(submissions.map(s => s.studentId))].length
  const withFeedback = submissions.filter(s => s.feedback).length
  const latestSubs = [...submissions].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2rem 3rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
          <button className="btn btn-ghost" style={{ padding: '0.125rem 0', fontSize: '0.875rem' }} onClick={() => navigate('/teacher/dashboard')}>Classrooms</button>
          <span>/</span>
          <button className="btn btn-ghost" style={{ padding: '0.125rem 0', fontSize: '0.875rem' }} onClick={() => navigate(`/teacher/classroom/${classroomId}`)}>{classroom?.name}</button>
          <span>/</span>
          <span style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>Analytics</span>
        </div>

        {/* Question header */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>{question.title}</h1>
                <span className={`badge ${diffColors[question.difficulty] || 'badge-medium'}`}>{question.difficulty}</span>
                <span className="badge" style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>{question.language}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', margin: 0 }}>
                {question.description.slice(0, 150)}{question.description.length > 150 ? '…' : ''}
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate(`/teacher/classroom/${classroomId}/question/${qid}/edit`)} style={{ fontSize: '0.875rem', flexShrink: 0 }}>
              ✏ Edit Question
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Submissions', value: submissions.length },
            { label: 'Students Attempted', value: uniqueStudents },
            { label: 'With LLM Feedback', value: withFeedback },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>{label}</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Submissions list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-outline-variant)' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>Student Submissions</span>
          </div>

          {submissions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
              <div style={{ fontWeight: 600 }}>No submissions yet</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.375rem' }}>Students haven&apos;t submitted answers for this question.</div>
            </div>
          ) : (
            latestSubs.map((sub, idx) => (
              <SubmissionRow key={sub.id} sub={sub} isLast={idx === latestSubs.length - 1} />
            ))
          )}
        </div>
      </main>
    </div>
  )
}

function SubmissionRow({ sub, isLast }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-outline-variant)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', gap: '1rem', flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {sub.studentName[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-on-surface)' }}>{sub.studentName}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
              Submitted {new Date(sub.submittedAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {sub.feedback ? (
            <span className="badge badge-medium">Has LLM Feedback</span>
          ) : (
            <span className="badge badge-active">Clean Submit</span>
          )}
          <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
          {sub.feedback && (
            <div style={{ background: 'var(--color-primary-fixed)', border: '1px solid var(--color-primary-fixed-dim)', borderRadius: 'var(--radius-lg)', padding: '0.875rem', marginBottom: '0.875rem' }}>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--color-primary)', marginBottom: '0.375rem' }}>✨ LLM Feedback</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface)', margin: 0, lineHeight: 1.6 }}>{sub.feedback}</p>
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
            Submitted Code
          </div>
          <pre style={{ background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--color-on-surface)', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap' }}>
            {sub.code}
          </pre>
        </div>
      )}
    </div>
  )
}

import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { classroomStore, questionStore, submissionStore } from '../store/mockStore'
import { useAuth } from '../hooks/useAuth'

export default function StudentClassroomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const classroom = classroomStore.byId(id)
  const questions = questionStore.forClassroom(id)

  const diffColors = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }

  if (!classroom) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            <div style={{ fontWeight: 600 }}>Classroom not found</div>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/student/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2rem 3rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
          <button className="btn btn-ghost" style={{ padding: '0.125rem 0', fontSize: '0.875rem' }} onClick={() => navigate('/student/dashboard')}>
            My Classes
          </button>
          <span>/</span>
          <span style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>{classroom.name}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 0.25rem' }}>
            {classroom.name}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', margin: 0 }}>
            {classroom.description || `Taught by ${classroom.teacherName}`}
          </p>
        </div>

        {/* Questions */}
        {questions.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
            <div style={{ fontWeight: 600 }}>No questions yet</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.375rem' }}>Your teacher hasn&apos;t added any questions yet. Check back soon.</div>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-outline-variant)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>
                Questions ({questions.length})
              </span>
            </div>
            {questions.map((q, idx) => {
              const submission = submissionStore.byStudentQuestion(q.id, user.id)
              const isLast = idx === questions.length - 1
              return (
                <div
                  key={q.id}
                  onClick={() => navigate(`/student/classroom/${id}/question/${q.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderBottom: isLast ? 'none' : '1px solid var(--color-outline-variant)',
                    gap: '1rem', flexWrap: 'wrap', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-low)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-DEFAULT)', background: submission ? '#dcfce7' : 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: submission ? '#166534' : 'var(--color-primary-container)', flexShrink: 0 }}>
                      {submission ? '✓' : idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {q.title}
                        <span className={`badge ${diffColors[q.difficulty] || 'badge-medium'}`}>{q.difficulty}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', marginTop: '0.125rem' }}>
                        {q.language} • {q.constraints?.length || 0} constraints
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    {submission ? (
                      <span className="badge badge-active">Submitted</span>
                    ) : (
                      <span className="badge badge-archived">Not started</span>
                    )}
                    <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>→</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

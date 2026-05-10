import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { getClassroom } from '../api/classroom'
import { getQuestion } from '../api/question'
import { getSubmissions } from '../api/submission'

function parseFeedback(raw) {
  try {
    const stripped = raw.replace(/^```(?:json)?\s*\n/, '').replace(/\n```\s*$/, '')
    return JSON.parse(stripped)
  } catch {
    return null
  }
}

function groupByStudent(submissions) {
  const map = {}
  submissions.forEach(sub => {
    if (!map[sub.student_id]) {
      map[sub.student_id] = { studentName: sub.student_name, studentId: sub.student_id, submissions: [] }
    }
    map[sub.student_id].submissions.push(sub)
  })
  return Object.values(map)
}

export default function AnalyticsPage() {
  const { id: classroomId, qid } = useParams()
  const navigate = useNavigate()

  const [classroom, setClassroom] = useState(null)
  const [question, setQuestion] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classroomData, questionData, submissionsData] = await Promise.all([
          getClassroom(classroomId),
          getQuestion(qid),
          getSubmissions(qid),
        ])
        setClassroom(classroomData)
        setQuestion(questionData)
        setSubmissions(submissionsData || [])
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [classroomId, qid])

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner size={40} />
        </main>
      </div>
    )
  }

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

  const studentGroups = groupByStudent(submissions)
  const uniqueStudents = studentGroups.length
  const withFeedback = submissions.filter(s => s.feedback).length
  const diffColors = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }

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
                {question.description?.slice(0, 150)}{question.description?.length > 150 ? '…' : ''}
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate(`/teacher/classroom/${classroomId}/question/${qid}/edit`, { state: { question } })} style={{ fontSize: '0.875rem', flexShrink: 0 }}>
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

        {/* Submissions grouped by student */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-outline-variant)' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>Student Submissions</span>
          </div>

          {submissions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
              <div style={{ fontWeight: 600 }}>No submissions yet</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.375rem' }}>Students haven't submitted answers for this question.</div>
            </div>
          ) : (
            studentGroups.map((group, gidx) => (
              <StudentGroup
                key={group.studentId}
                group={group}
                isLast={gidx === studentGroups.length - 1}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}

function StudentGroup({ group, isLast }) {
  const [expanded, setExpanded] = useState(false)
  const latest = group.submissions[0]
  const attemptCount = group.submissions.length

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-outline-variant)' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', gap: '1rem', flexWrap: 'wrap', cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {group.studentName[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-on-surface)' }}>{group.studentName}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
              {attemptCount} attempt{attemptCount !== 1 ? 's' : ''} · Last {new Date(latest.CreatedAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {latest.feedback ? (
            <span className="badge badge-medium">Has LLM Feedback</span>
          ) : (
            <span className="badge badge-active">Submitted</span>
          )}
          <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
          {group.submissions.map((sub, idx) => {
            const feedback = sub.feedback ? parseFeedback(sub.feedback) : null
            return (
              <div key={sub.ID} style={{
                padding: '1rem 0',
                borderBottom: idx !== group.submissions.length - 1 ? '1px solid var(--color-outline-variant)' : 'none',
              }}>
                <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.75rem' }}>
                  Attempt #{group.submissions.length - idx} · {new Date(sub.CreatedAt).toLocaleString()}
                  {feedback && (
                    <span className={`badge ${feedback.status === 'passed' ? 'badge-active' : feedback.status === 'error' ? 'badge-archived' : 'badge-medium'}`} style={{ marginLeft: '0.75rem', verticalAlign: 'middle' }}>
                      {feedback.status?.toUpperCase() || 'NEEDS IMPROVEMENT'}
                    </span>
                  )}
                </div>

                {feedback && (
                  <div style={{ background: 'var(--color-primary-fixed)', border: '1px solid var(--color-primary-fixed-dim)', borderRadius: 'var(--radius-lg)', padding: '0.875rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--color-primary)', marginBottom: '0.375rem' }}>✨ LLM Feedback</div>
                    {feedback.suggestions && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.125rem', color: 'var(--color-on-surface)' }}>💡 Suggestions</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface)', margin: 0, lineHeight: 1.6 }}>{feedback.suggestions}</p>
                      </div>
                    )}
                    {feedback.issues && (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.125rem', color: 'var(--color-error)' }}>⚠️ Issues</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface)', margin: 0, lineHeight: 1.6 }}>{feedback.issues}</p>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
                  Submitted Code
                </div>
                <pre style={{ background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--color-on-surface)', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {sub.code}
                </pre>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

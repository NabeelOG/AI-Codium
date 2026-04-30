import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { getClassroom } from '../api/classroom'
import { getClassroomQuestions } from '../api/question'
import { getClassroomStudents } from '../api/enrollment'

export default function ClassroomManagePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('questions')
  const [classroom, setClassroom] = useState(null)
  const [questions, setQuestions] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classroomData = await getClassroom(id)
        // const questionsData = await getClassroomQuestions(id)
        // const studentsData = await getClassroomStudents(id)
        
        setClassroom(classroomData)
        // setQuestions(questionsData)
        // setStudents(studentsData)
      } catch (error) {
        console.error('Failed to load classroom:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [id])

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${classroom?.invite_code}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteQuestion = (qid) => {
    if (!confirm('Delete this question and all submissions?')) return
    // TODO: Implement delete API call
    // questionStore.delete(qid)
    navigate(0) // refresh
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading...</div>
        </main>
      </div>
    )
  }

  if (!classroom) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            <div style={{ fontWeight: 600 }}>Classroom not found</div>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/teacher/dashboard')}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
          <button className="btn btn-ghost" style={{ padding: '0.125rem 0', fontSize: '0.875rem' }} onClick={() => navigate('/teacher/dashboard')}>
            Classrooms
          </button>
          <span>/</span>
          <span style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>{classroom.name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 0.25rem' }}>
              {classroom.name}
            </h1>
            {classroom.description && (
              <p style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', margin: 0 }}>
                {classroom.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'var(--color-surface-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-DEFAULT)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Invite Code:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary-container)', letterSpacing: '0.1em' }}>{classroom.invite_code}</span>
            </div>
            <button className="btn btn-secondary" onClick={copyLink} style={{ fontSize: '0.875rem' }}>
              {copied ? '✓ Copied!' : '🔗 Copy Invite Link'}
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/teacher/classroom/${id}/question/new`)} style={{ fontSize: '0.875rem' }}>
              + Add Question
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Students', value: students.length },
            { label: 'Questions', value: questions.length },
            { label: 'Status', value: classroom.archived ? 'Archived' : 'Active' },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.375rem' }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-outline-variant)', marginBottom: '1.5rem' }}>
          {['questions', 'students'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.625rem 1.25rem',
                fontFamily: 'var(--font-grotesk)', fontSize: '0.875rem', fontWeight: 600,
                border: 'none', background: 'none', cursor: 'pointer',
                color: activeTab === tab ? 'var(--color-primary-container)' : 'var(--color-on-surface-variant)',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary-container)' : '2px solid transparent',
                textTransform: 'capitalize', transition: 'color 0.15s',
                marginBottom: '-1px',
              }}
            >
              {tab === 'questions' ? `Questions (${questions.length})` : `Students (${students.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'questions' && (
          <div>
            {questions.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📝</div>
                <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>No questions yet</div>
                <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Add your first coding question for students.</div>
                <button className="btn btn-primary" onClick={() => navigate(`/teacher/classroom/${id}/question/new`)}>
                  + Add Question
                </button>
              </div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                {questions.map((q, idx) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    isLast={idx === questions.length - 1}
                    onAnalytics={() => navigate(`/teacher/classroom/${id}/question/${q.id}/analytics`)}
                    onEdit={() => navigate(`/teacher/classroom/${id}/question/${q.id}/edit`)}
                    onDelete={() => handleDeleteQuestion(q.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            {students.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👥</div>
                <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>No students yet</div>
                <div style={{ fontSize: '0.875rem' }}>Share the invite link or code <strong>{classroom.inviteCode}</strong> with your students.</div>
              </div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                {students.map((s, idx) => (
                  <div key={s.studentId || s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.875rem 1.25rem',
                    borderBottom: idx === students.length - 1 ? 'none' : '1px solid var(--color-outline-variant)',
                  }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {(s.studentName || s.name)[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-on-surface)' }}>{s.studentName || s.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
                        Joined {new Date(s.createdAt || s.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function QuestionRow({ question, isLast, onAnalytics, onEdit, onDelete }) {
  const diffColors = {
    easy: 'badge-easy',
    medium: 'badge-medium',
    hard: 'badge-hard',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 1.25rem',
      borderBottom: isLast ? 'none' : '1px solid var(--color-outline-variant)',
      gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-DEFAULT)', background: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-container)', flexShrink: 0 }}>
          {'</>'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-surface)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {question.title}
            <span className={`badge ${diffColors[question.difficulty] || 'badge-medium'}`}>{question.difficulty}</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
            {question.language} • Added {new Date(question.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button className="btn btn-ghost" onClick={onAnalytics} style={{ fontSize: '0.8125rem' }}>
          📊 Analytics
        </button>
        <button className="btn btn-secondary" onClick={onEdit} style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
          ✏ Edit
        </button>
        <button onClick={onDelete} style={{ padding: '0.375rem 0.625rem', background: 'none', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-DEFAULT)', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--color-error)' }}>
          🗑
        </button>
      </div>
    </div>
  )
}
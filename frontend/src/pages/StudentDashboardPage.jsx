import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { getStudentClassrooms, joinClassroom } from '../api/classroom'
import { getClassroomQuestions } from '../api/question'
import LoadingSpinner from '../components/LoadingSpinner'

function JoinModal({ onClose, onJoin, isLoading }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim()) { 
      setError('Enter an invite code.'); 
      return 
    }
    const result = await onJoin(code.trim().toUpperCase())
    if (result?.error) setError(result.error)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            Join a Classroom
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-on-surface-variant)', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="field-label">Invite Code</label>
            <input
              className={`field-input${error ? ' error' : ''}`}
              type="text"
              placeholder="e.g. ABC123"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
              autoFocus
              maxLength={8}
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', fontWeight: 700, fontSize: '1rem' }}
            />
            {error && <p className="field-error">{error}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Joining...' : 'Join Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showJoin, setShowJoin] = useState(false)
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [questionsCount, setQuestionsCount] = useState({})

  // Load classrooms on component mount
  useEffect(() => {
    loadClassrooms()
  }, [])

  const loadClassrooms = async () => {
    setLoading(true)
    try {
      const data = await getStudentClassrooms()
      setClassrooms(data)
      
      // Load question counts for each classroom
      const counts = {}
      for (const classroom of data) {
        const questions = await getClassroomQuestions(classroom.id)
        counts[classroom.id] = questions.length
      }
      setQuestionsCount(counts)
    } catch (error) {
      console.error('Failed to load classrooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (code) => {
    setJoining(true)
    try {
      await joinClassroom(code)
      // Refresh the classroom list after joining
      await loadClassrooms()
      setShowJoin(false)
      return {} // Success, no error
    } catch (error) {
      console.error('Join error:', error)
      let errorMessage = 'Failed to join classroom.'
      
      if (error.response?.status === 404) {
        errorMessage = 'No classroom found with this code.'
      } else if (error.response?.status === 403) {
        errorMessage = error.response.data?.error || 'Cannot join this classroom.'
      } else if (error.response?.status === 409) {
        errorMessage = 'You are already enrolled in this classroom.'
      }
      
      return { error: errorMessage }
    } finally {
      setJoining(false)
    }
  }

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2rem 3rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 0.25rem' }}>
              My Classrooms
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Welcome back, {user?.name}. Pick up where you left off.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowJoin(true)} style={{ fontSize: '0.875rem' }}>
            + Join Classroom
          </button>
        </div>

        {classrooms.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎓</div>
            <div style={{ fontWeight: 600, marginBottom: '0.375rem', fontSize: '1.125rem' }}>No classrooms yet</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>Ask your teacher for an invite code and join your first classroom.</div>
            <button className="btn btn-primary" onClick={() => setShowJoin(true)}>+ Join Classroom</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {classrooms.map(cls => (
              <ClassroomCard 
                key={cls.id} 
                classroom={cls} 
                onEnter={() => navigate(`/student/classroom/${cls.id}`)} 
                questionCount={questionsCount[cls.id] || 0}
              />
            ))}
          </div>
        )}
      </main>

      {showJoin && (
        <JoinModal 
          onClose={() => setShowJoin(false)} 
          onJoin={handleJoin}
          isLoading={joining}
        />
      )}
    </div>
  )
}

function ClassroomCard({ classroom, onEnter, questionCount }) {
  return (
    <div className="card" style={{ padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow 0.2s' }} onClick={onEnter}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
          🏫
        </div>
        <span className={`badge badge-${classroom.archived ? 'archived' : 'active'}`}>
          {classroom.archived ? 'archived' : 'active'}
        </span>
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 0.375rem' }}>
        {classroom.name}
      </h3>
      {classroom.description && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
          {classroom.description.slice(0, 80)}{classroom.description.length > 80 ? '…' : ''}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
          {questionCount} question{questionCount !== 1 ? 's' : ''} • by {classroom.teacher_name || classroom.teacherName}
        </div>
        <button className="btn btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.125rem 0.25rem' }}>
          Open →
        </button>
      </div>
    </div>
  )
}
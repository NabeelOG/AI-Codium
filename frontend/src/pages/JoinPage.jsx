import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { classroomStore, enrollmentStore } from '../store/mockStore'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

export default function JoinPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [joined, setJoined] = useState(false)

  const classroom = classroomStore.byCode(code)

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/join/${code}` } } })
      return
    }
    if (user?.role === 'teacher') {
      setError('Teachers cannot join classrooms as students.')
      return
    }
    setJoining(true)
    await new Promise(r => setTimeout(r, 500))
    enrollmentStore.enroll(classroom.id, user.id, user.name)
    setJoined(true)
    setJoining(false)
    setTimeout(() => navigate(`/student/classroom/${classroom.id}`), 1200)
  }

  const alreadyEnrolled = isAuthenticated && user?.role === 'student' && classroom
    ? enrollmentStore.isEnrolled(classroom.id, user.id)
    : false

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-container)' }}>&gt;_</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>CodeClass</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', margin: 0 }}>
            You&apos;ve been invited to join a classroom
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {!classroom ? (
            <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.375rem', color: 'var(--color-on-surface)' }}>
                Invite link not found
              </div>
              <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                The invite code <strong style={{ fontFamily: 'var(--font-mono)' }}>{code}</strong> doesn&apos;t match any classroom.
                Ask your teacher for a fresh link.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go to Login</Link>
            </div>
          ) : classroom.archived ? (
            <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.375rem', color: 'var(--color-on-surface)' }}>
                Classroom is closed
              </div>
              <p style={{ fontSize: '0.875rem' }}>This classroom has been archived by the teacher.</p>
            </div>
          ) : joined ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.375rem', color: 'var(--color-on-surface)' }}>
                You&apos;re in!
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
                Redirecting to <strong>{classroom.name}</strong>…
              </p>
              <LoadingSpinner size={20} color="var(--color-primary-container)" />
            </div>
          ) : (
            <>
              {/* Classroom info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-surface-low)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  🏫
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-on-surface)', marginBottom: '0.25rem' }}>{classroom.name}</div>
                  {classroom.description && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>{classroom.description}</div>
                  )}
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
                    Taught by <strong>{classroom.teacherName}</strong>
                  </div>
                </div>
              </div>

              {error && (
                <div role="alert" style={{ background: 'var(--color-error-container)', color: 'var(--color-on-error-container)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-DEFAULT)', padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  {error}
                </div>
              )}

              {alreadyEnrolled ? (
                <div>
                  <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', marginBottom: '1rem' }}>
                    You&apos;re already enrolled in this classroom.
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/student/classroom/${classroom.id}`)}>
                    Open Classroom →
                  </button>
                </div>
              ) : isAuthenticated ? (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }} onClick={handleJoin} disabled={joining}>
                  {joining ? <><LoadingSpinner size={18} color="#fff" /> Joining…</> : 'Join Classroom'}
                </button>
              ) : (
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', textAlign: 'center', marginBottom: '1rem' }}>
                    Sign in to join this classroom.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link
                      to="/login"
                      state={{ from: { pathname: `/join/${code}` } }}
                      className="btn btn-primary"
                      style={{ textDecoration: 'none', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }}
                    >
                      Sign In to Join
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-secondary"
                      style={{ textDecoration: 'none', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }}
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

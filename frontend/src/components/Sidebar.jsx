import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const TEACHER_NAV = [
  { to: '/teacher/dashboard', icon: '⊞', label: 'Classrooms' },
]

const STUDENT_NAV = [
  { to: '/student/dashboard', icon: '⊞', label: 'My Classes' },
]

export default function Sidebar({ onCreateClassroom }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isTeacher = user?.role === 'teacher'
  const navItems = isTeacher ? TEACHER_NAV : STUDENT_NAV

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: '220px',
      minWidth: '220px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'var(--color-surface-lowest)',
      borderRight: '1px solid var(--color-outline-variant)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '0 1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary-container)' }}>
            &gt;_
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-on-surface)', lineHeight: 1.2 }}>
              CodeClass
            </div>
            <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>
              {isTeacher ? 'Instructor Portal' : 'Student Portal'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 0.75rem' }}>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-DEFAULT)',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-primary-container)' : 'var(--color-on-surface-variant)',
              background: isActive ? 'var(--color-primary-fixed)' : 'transparent',
              textDecoration: 'none',
              marginBottom: '0.125rem',
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            <span style={{ fontSize: '1rem', opacity: 0.8 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + actions */}
      <div style={{ padding: '1rem 0.75rem 0', borderTop: '1px solid var(--color-outline-variant)' }}>
        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--color-primary-container)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-on-surface-variant)', textTransform: 'capitalize' }}>
              {user?.role || 'student'}
            </div>
          </div>
        </div>

        {isTeacher && onCreateClassroom && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '0.5rem', justifyContent: 'center', fontSize: '0.875rem' }}
            onClick={onCreateClassroom}
          >
            + New Classroom
          </button>
        )}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            width: '100%', padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-DEFAULT)',
            fontSize: '0.875rem', color: 'var(--color-on-surface-variant)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            width: '100%', padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-DEFAULT)',
            fontSize: '0.875rem', color: 'var(--color-on-surface-variant)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ⇠ Log Out
        </button>
      </div>
    </aside>
  )
}

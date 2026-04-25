import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header
      style={{
        background: 'var(--color-surface-lowest)',
        borderBottom: '1px solid var(--color-outline-variant)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--color-primary-container)',
              letterSpacing: '-0.02em',
            }}
          >
            &gt;_
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.01em',
            }}
          >
            CodeClass
          </span>
        </Link>

        {/* Nav links */}
        {isAuthenticated && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/classroom">Classroom</NavLink>
          </nav>
        )}

        {/* Auth actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <>
              <span
                style={{
                  fontFamily: 'var(--font-grotesk)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                {user?.name || user?.email || 'Account'}
              </span>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.375rem 0.875rem', fontSize: '0.875rem' }}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login" style={{ fontSize: '0.875rem' }}>
                Log In
              </Link>
              <Link className="btn btn-primary" to="/register" style={{ fontSize: '0.875rem' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--color-on-surface-variant)',
        textDecoration: 'none',
        padding: '0.375rem 0.75rem',
        borderRadius: 'var(--radius-DEFAULT)',
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--color-surface-container)'
        e.currentTarget.style.color = 'var(--color-on-surface)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--color-on-surface-variant)'
      }}
    >
      {children}
    </Link>
  )
}

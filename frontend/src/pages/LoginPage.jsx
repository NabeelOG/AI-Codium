import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import FormInput from '../components/FormInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { login as apiLogin } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'


  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const result = await apiLogin(data)
      login(result.token, result.user)
      const dest = from !== '/dashboard' ? from
        : result.user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.'
      setServerError(msg)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-container)' }}>
              &gt;_
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              CodeClass
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 0.375rem' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-on-surface-variant)', margin: 0 }}>
            Sign in to continue your learning journey.
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* Server-level error */}
          {serverError && (
            <div
              role="alert"
              style={{
                background: 'var(--color-error-container)',
                color: 'var(--color-on-error-container)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-DEFAULT)',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
              registration={register('email', {
                required: 'Email is required.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address.',
                },
              })}
            />

            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password}
              registration={register('password', {
                required: 'Password is required.',
                minLength: { value: 8, message: 'Password must be at least 8 characters.' },
              })}
            />

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginTop: '-0.75rem', marginBottom: '1.5rem' }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.8125rem', color: 'var(--color-primary-container)', textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={18} color="#fff" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary-container)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          marginTop: '1.5rem',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: '✓', text: 'Industry Verified' },
            { icon: '🔒', text: 'Encrypted Learning' },
            { icon: '⚡', text: 'Deep Work Focus' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}
            >
              <span>{icon}</span>
              <span style={{ fontFamily: 'var(--font-grotesk)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.02em' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

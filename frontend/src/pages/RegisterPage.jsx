import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { register as apiRegister } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [serverError, setServerError] = useState('')
  const [role, setRole] = useState('student')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' })

  const password = watch('password')

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const result = await apiRegister({ ...data, role })
      login(result.token, result.user)
      navigate(result.user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      if(err.response.data.error === 'Failed to create user, Email already taken') {
        setServerError('Already account existing on this email')
        return;
      }
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
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-container)' }}>
              &gt;_
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              CodeClass
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 0.375rem' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-on-surface-variant)', margin: 0 }}>
            Join the community of modern software engineers and instructors.
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
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

          {/* Role selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="field-label" style={{ marginBottom: '0.625rem' }}>Select your role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { value: 'teacher', icon: '🏫', label: 'Teacher' },
                { value: 'student', icon: '👤', label: 'Student' },
              ].map(({ value, icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${role === value ? 'var(--color-primary-container)' : 'var(--color-outline-variant)'}`,
                    background: role === value ? 'var(--color-primary-fixed)' : 'var(--color-surface-lowest)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                  <span style={{
                    fontFamily: 'var(--font-grotesk)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: role === value ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormInput
              id="name"
              label="Full Name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              error={errors.name}
              registration={register('name', {
                required: 'Full name is required.',
                minLength: { value: 2, message: 'Name must be at least 2 characters.' },
              })}
            />

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
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              error={errors.password}
              registration={register('password', {
                required: 'Password is required.',
                minLength: { value: 8, message: 'Password must be at least 8 characters.' },
              })}
            />

            <FormInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              registration={register('confirmPassword', {
                required: 'Please confirm your password.',
                validate: (value) => value === password || 'Passwords do not match.',
              })}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', marginTop: '0.25rem' }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={18} color="#fff" />
                  Creating account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary-container)', fontWeight: 600, textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { icon: '✓', text: 'Industry Verified' },
            { icon: '🔒', text: 'Encrypted Learning' },
            { icon: '⚡', text: 'Deep Work Focus' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
              <span>{icon}</span>
              <span style={{ fontFamily: 'var(--font-grotesk)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.02em' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

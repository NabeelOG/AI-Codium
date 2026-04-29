import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { getClassrooms, createClassroom } from '../api/classroom'
import LoadingSpinner from '../components/LoadingSpinner'

function CreateClassroomModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Classroom name is required.'); return }
    onCreate({ name: name.trim(), description: description.trim() })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            Create New Classroom
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-on-surface-variant)', lineHeight: 1 }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="field-label">Classroom Name *</label>
            <input
              className={`field-input${error ? ' error' : ''}`}
              type="text"
              placeholder="e.g. Advanced JavaScript"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              autoFocus
            />
            {error && <p className="field-error">{error}</p>}
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="field-label">Description (optional)</label>
            <textarea
              className="field-input"
              placeholder="What will students learn in this classroom?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Classroom</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getClassrooms()
      .then(setClassrooms)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = classrooms.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = classrooms.filter(c => !c.archived).length

  const handleCreate = async ({ name, description }) => {
    try {
      const newRoom = await createClassroom({ name, description })
      setClassrooms(prev => [...prev, newRoom])
      setShowModal(false)
    } catch {
      /* creation failed */
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Sidebar onCreateClassroom={() => setShowModal(true)} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2rem 3rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 0.25rem' }}>
              Classrooms
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Manage your active learning environments and student rosters.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: 'var(--color-outline)' }}>🔍</span>
              <input
                type="search"
                placeholder="Search classrooms…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-DEFAULT)', fontSize: '0.875rem', background: 'var(--color-surface-lowest)', color: 'var(--color-on-surface)', outline: 'none', width: '220px' }}
              />
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: '0.875rem' }}>
              + Create New Classroom
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Active Classrooms', value: activeCount },
            { label: 'Total Classrooms', value: classrooms.length },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
                {label}
              </div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-on-surface)', lineHeight: 1.1 }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Classrooms table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>Your Classrooms</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>{classrooms.length} total</span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <LoadingSpinner size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              {classrooms.length === 0 ? (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏫</div>
                  <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>No classrooms yet</div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Create your first classroom to get started.</div>
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Classroom</button>
                </div>
              ) : (
                `No classrooms match "${search}"`
              )}
            </div>
          ) : (
            filtered.map((cls, idx) => (
              <ClassroomRow
                key={cls.ID}
                cls={cls}
                isLast={idx === filtered.length - 1}
                onEnter={() => navigate(`/teacher/classroom/${cls.id}`)}
                onRefresh={() => setClassrooms(classroomStore.forTeacher(user.id))}
              />
            ))
          )}
        </div>
      </main>

      {showModal && (
        <CreateClassroomModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}

function ClassroomRow({ cls, isLast, onEnter, onRefresh }) {
  const [copied, setCopied] = useState(false)

  const copyLink = useCallback(() => {
    const url = `${window.location.origin}/join/${cls.invite_code}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [cls.invite_code])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 1.25rem',
      borderBottom: isLast ? 'none' : '1px solid var(--color-outline-variant)',
      gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
          ▶
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-surface)', marginBottom: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {cls.name}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
            Created {new Date(cls.createdAt).toLocaleDateString()}
            {cls.description && ` • ${cls.description.slice(0, 50)}${cls.description.length > 50 ? '…' : ''}`}
          </div>
        </div>
      </div>

      {/* <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>Students</div>
          <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-on-surface)' }}>{studentCount}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>Status</div>
          <span className={`badge badge-${cls.archived ? 'archived' : 'active'}`}>{cls.archived ? 'archived' : 'active'}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>Code</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary-container)', letterSpacing: '0.1em' }}>{cls.inviteCode}</div>
        </div>
      </div> */}

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        {!cls.archived ? (
          <>
            <button className="btn btn-secondary" onClick={copyLink} style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
              {copied ? '✓ Copied' : '🔗 Copy Invite'}
            </button>
            <button className="btn btn-primary" onClick={onEnter} style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
              Manage →
            </button>
          </>
        ) : (
          <button className="btn btn-secondary" onClick={onEnter} style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
            View
          </button>
        )}
      </div>
    </div>
  )
}

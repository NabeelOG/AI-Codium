import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { useTheme } from '../hooks/useTheme'
import { getClassroomQuestions, createQuestion, getQuestion, updateQuestion } from '../api/question'
import { getClassroom } from '../api/classroom'

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'typescript']

export default function QuestionCreatorPage() {
  const { id: classroomId, qid } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = Boolean(qid)
  const passedQuestion = location.state?.question
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [language, setLanguage] = useState('javascript')
  const [constraints, setConstraints] = useState('')
  const [templateCode, setTemplateCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [classroom, setClassroom] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {

        const classroomData = await getClassroom(classroomId)
        setClassroom(classroomData)

        if (isEdit && passedQuestion) {
          setTitle(passedQuestion.title || '')
          setDescription(passedQuestion.description || '')
          setDifficulty(passedQuestion.difficulty || '')
          setLanguage(passedQuestion.language || '')
          setConstraints(passedQuestion.constraints?.join('\n') || '')
          setTemplateCode(passedQuestion.template_code)
        }
      } catch (error) {
        console.error('Failed to load:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [classroomId, qid, isEdit])

  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Title is required.'
    if (!description.trim()) e.description = 'Description is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const payload = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      language,
      constraints: constraints.split('\n').map(s => s.trim()).filter(Boolean),
      template_code: templateCode,
    }

    try{
      if (isEdit) {
        await updateQuestion(qid, payload)
      } else {
        await createQuestion(classroomId, payload)
      }
      navigate(`/teacher/classroom/${classroomId}`)
    } catch (error) {
      console.error('Failed to save', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2rem 3rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
          <button className="btn btn-ghost" style={{ padding: '0.125rem 0', fontSize: '0.875rem' }} onClick={() => navigate('/teacher/dashboard')}>Classrooms</button>
          <span>/</span>
          <button className="btn btn-ghost" style={{ padding: '0.125rem 0', fontSize: '0.875rem' }} onClick={() => navigate(`/teacher/classroom/${classroomId}`)}>{classroom?.name || 'Classroom'}</button>
          <span>/</span>
          <span style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>{isEdit ? 'Edit Question' : 'New Question'}</span>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 1.5rem' }}>
          {isEdit ? 'Edit Question' : 'Create Question'}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left: question details */}
          <div>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 1.25rem' }}>Question Details</h2>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="field-label">Title *</label>
                <input
                  className={`field-input${errors.title ? ' error' : ''}`}
                  type="text"
                  placeholder="e.g. Two Sum"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(v => ({ ...v, title: '' })) }}
                />
                {errors.title && <p className="field-error">{errors.title}</p>}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="field-label">Description *</label>
                <textarea
                  className={`field-input${errors.description ? ' error' : ''}`}
                  placeholder="Describe the problem clearly. Include examples."
                  value={description}
                  onChange={e => { setDescription(e.target.value); setErrors(v => ({ ...v, description: '' })) }}
                  rows={6}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}
                />
                {errors.description && <p className="field-error">{errors.description}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="field-label">Difficulty</label>
                  <select
                    className="field-input"
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Language</label>
                  <select
                    className="field-input"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="field-label">Constraints (one per line)</label>
                <textarea
                  className="field-input"
                  placeholder={`1 <= n <= 10^5\n-10^9 <= nums[i] <= 10^9`}
                  value={constraints}
                  onChange={e => setConstraints(e.target.value)}
                  rows={4}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                />
              </div>
            </div>
          </div>

          {/* Right: template code */}
          <div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>Starter Template Code</h2>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-container)' }}>
                  {language}
                </span>
              </div>
              <div style={{ height: '420px' }}>
                <Editor
                  height="420px"
                  language={language === 'cpp' ? 'cpp' : language}
                  value={templateCode}
                  onChange={v => setTemplateCode(v || '')}
                  theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              </div>
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-low)', fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
                This code is pre-loaded in the student editor when they open the question.
              </div>
            </div>
          </div>
        </div>

        {/* Save bar */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-outline-variant)' }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/teacher/classroom/${classroomId}`)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: '140px', justifyContent: 'center' }}>
            {saving ? <><LoadingSpinner size={16} color="#fff" /> Saving…</> : (isEdit ? '✓ Save Changes' : '+ Create Question')}
          </button>
        </div>
      </main>
    </div>
  )
}

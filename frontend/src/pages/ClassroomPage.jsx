import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'
import { getClassroom } from '../api/classroom'
import { getQuestion } from '../api/question'
import { submitCode, getMySubmission } from '../api/submission'

export default function StudentQuestionPage() {
  const { id: classroomId, qid } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [classroom, setClassroom] = useState(null)
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState([])
  const [running, setRunning] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('output')
  const [llmFeedback, setLlmFeedback] = useState(null)
  const [existingSubmission, setExistingSubmission] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classroomData, questionData] = await Promise.all([
          getClassroom(classroomId),
          getQuestion(qid)
        ])

        setClassroom(classroomData)
        setQuestion(questionData)
        setCode(questionData.template_code || '')

        // Check for existing submission
        try {
          const submission = await getMySubmission(qid)
          if (submission.submitted) {
            setExistingSubmission(submission)
            setCode(submission.code || questionData.template_code || '')
            setLlmFeedback(submission.feedback)
            setSubmitted(true)
          }
        } catch (err) {
          console.log('No existing submission:', err)
        }
      } catch (error) {
        console.error('Failed to load:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [classroomId, qid])

  // const handleRun = async () => {
  //   setRunning(true)
  //   setOutput([{ type: 'info', text: 'Running your code…' }])
  //   setActiveTab('output')

  //   // Simulate test execution (replace with actual backend execution later)
  //   await new Promise(r => setTimeout(r, 900))
  //   setOutput([
  //     { type: 'check', text: 'Test Case 1: Passed' },
  //     { type: 'check', text: 'Test Case 2: Passed' },
  //     { type: 'info', text: 'All visible test cases passed.' },
  //   ])
  //   setRunning(false)
  // }

  const handleSubmit = async () => {
    if (!user) return

    setRunning(true)
    setOutput([{ type: 'info', text: 'Submitting and analysing with AI…' }])
    setActiveTab('output')

    try {
      const result = await submitCode(qid, { code })

      setLlmFeedback(result.feedback)
      setSubmitted(true)
      setExistingSubmission(result.submission)

      setOutput([
        { type: 'check', text: result.feedback ? 'Submitted with feedback — review the LLM note.' : 'Solution submitted successfully!' },
        { type: 'info', text: `Submitted at ${new Date().toLocaleTimeString()}` },
      ])
    } catch (error) {
      console.error('Submission failed:', error)
      setOutput([
        { type: 'error', text: 'Failed to submit. Please try again.' },
      ])
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
        <LoadingSpinner size={40} />
      </div>
    )
  }

  if (!question) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
          <div style={{ fontWeight: 600 }}>Question not found</div>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate(`/student/classroom/${classroomId}`)}>
            Back to Classroom
          </button>
        </div>
      </div>
    )
  }

  const diffColors = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-surface)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ height: '48px', borderBottom: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-lowest)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '1rem', flexShrink: 0 }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
            onClick={() => navigate(`/student/classroom/${classroomId}`)}
          >
            ← Back
          </button>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>{classroom?.name}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>
              {user?.name}
            </span>
            {submitted && <span className="badge badge-active">Submitted</span>}
          </div>
        </div>

        {/* Main two-panel */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
          {/* LEFT: Problem description */}
          <div style={{ borderRight: '1px solid var(--color-outline-variant)', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
              <span className={`badge ${diffColors[question.difficulty] || 'badge-medium'}`}>{question.difficulty}</span>
              <span className="badge" style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>
                {question.language}
              </span>
            </div>

            <h1 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.875rem' }}>
              {question.title}
            </h1>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.7, marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>
              {question.description}
            </p>

            {question.constraints?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
                  Constraints
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 1.25rem', listStyle: 'disc' }}>
                  {question.constraints.map((c, i) => (
                    <li key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-on-surface)', lineHeight: 1.8 }}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* LLM Feedback panel */}
            {llmFeedback && (
              <div style={{ background: 'var(--color-primary-fixed)', border: '1px solid var(--color-primary-fixed-dim)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  ✨ LLM Feedback
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface)', margin: 0, lineHeight: 1.6 }}>
                  {llmFeedback}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Code editor + console */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Editor toolbar */}
            <div style={{ height: '42px', borderBottom: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', padding: '0 0.875rem', gap: '0.75rem', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary-container)', fontWeight: 600 }}>
                {question.language}
              </span>
              <span style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                solution.{question.language === 'python' ? 'py' : question.language === 'java' ? 'java' : 'js'}
              </span>
              {submitted && existingSubmission && (
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-grotesk)', fontSize: '0.6875rem', color: 'var(--color-on-surface-variant)' }}>
                  Last submitted {new Date(existingSubmission.updated_at).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Monaco editor */}
            <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
              <Editor
                height="100%"
                language={question.language === 'cpp' ? 'cpp' : question.language === 'typescript' ? 'typescript' : question.language}
                value={code}
                onChange={v => setCode(v || '')}
                theme="vs"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 12 },
                  readOnly: false,
                }}
              />
            </div>

            {/* Status bar */}
            <div style={{ height: '28px', background: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', padding: '0 0.875rem', gap: '1rem', flexShrink: 0 }}>
              <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-grotesk)', fontWeight: 600 }}>
                ● {question.language.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.7)', marginLeft: 'auto' }}>
                CodeClass Editor
              </span>
            </div>

            {/* Console tabs */}
            <div style={{ background: 'var(--color-surface-lowest)', borderTop: '1px solid var(--color-outline-variant)', flexShrink: 0 }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--color-outline-variant)', padding: '0 0.875rem' }}>
                {['output', 'debugger'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ fontFamily: 'var(--font-grotesk)', fontSize: '0.75rem', fontWeight: 600, padding: '0.5rem 0.75rem', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === tab ? 'var(--color-primary-container)' : 'var(--color-on-surface-variant)', borderBottom: activeTab === tab ? '2px solid var(--color-primary-container)' : '2px solid transparent', textTransform: 'capitalize', transition: 'color 0.15s' }}>
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{ height: '110px', overflowY: 'auto', padding: '0.625rem 0.875rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                {output.length === 0 ? (
                  <div style={{ color: 'var(--color-outline)', fontStyle: 'italic' }}>$ run your code to see output</div>
                ) : (
                  output.map((line, i) => (
                    <div key={i} style={{
                      color: line.type === 'check' ? '#166534'
                           : line.type === 'warn'  ? '#854d0e'
                           : line.type === 'error' ? 'var(--color-error)'
                           : 'var(--color-on-surface-variant)',
                      marginBottom: '0.125rem',
                    }}>
                      {line.type === 'check' ? '✓ ' : line.type === 'error' ? '✗ ' : line.type === 'warn' ? '⚠ ' : '  '}{line.text}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-lowest)', flexShrink: 0 }}>
              {/* <button className="btn btn-secondary" onClick={handleRun} disabled={running} style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}>
                {running ? <><LoadingSpinner size={14} /> Running…</> : '▶ Run Code'}
              </button>*/}
              <button className="btn btn-primary" onClick={handleSubmit} disabled={running} style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}>
                {running ? <><LoadingSpinner size={14} color="#fff" /> Submitting…</> : submitted ? '↺ Re-submit' : '🚀 Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

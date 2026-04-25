// localStorage-backed data store — used while backend is in development
// Replace each store method with real API calls when backend is ready

const K = {
  users:       'cc_users',
  classrooms:  'cc_classrooms',
  questions:   'cc_questions',
  enrollments: 'cc_enrollments',
  submissions: 'cc_submissions',
}

function get(key) {
  try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] }
}
function set(key, data) { localStorage.setItem(key, JSON.stringify(data)) }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

// ── Auth ──────────────────────────────────────────────────────────────────────
export const mockAuth = {
  register({ name, email, password, role }) {
    const users = get(K.users)
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      const err = new Error('Email already in use.')
      err.response = { data: { message: err.message } }
      throw err
    }
    const user = { id: uid(), name, email, password, role, createdAt: new Date().toISOString() }
    set(K.users, [...users, user])
    return user
  },
  login({ email, password }) {
    const user = get(K.users).find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) {
      const err = new Error('Invalid email or password.')
      err.response = { data: { message: err.message } }
      throw err
    }
    return user
  },
}

function fakeToken(user) {
  return btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }))
}
function toPublic(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role }
}

export function mockLoginAPI(data) {
  const user = mockAuth.login(data)
  return { token: fakeToken(user), user: toPublic(user) }
}
export function mockRegisterAPI(data) {
  const user = mockAuth.register(data)
  return { token: fakeToken(user), user: toPublic(user) }
}

// ── Classrooms ────────────────────────────────────────────────────────────────
export const classroomStore = {
  byId: (id) => get(K.classrooms).find(c => c.id === id),
  byCode: (code) => get(K.classrooms).find(c => c.inviteCode === code.toUpperCase()),
  forTeacher: (teacherId) => get(K.classrooms).filter(c => c.teacherId === teacherId),
  forStudent: (studentId) => {
    const ids = get(K.enrollments).filter(e => e.studentId === studentId).map(e => e.classroomId)
    return get(K.classrooms).filter(c => ids.includes(c.id))
  },
  create({ name, description, teacherId, teacherName }) {
    const list = get(K.classrooms)
    const item = {
      id: uid(),
      name,
      description: description || '',
      teacherId,
      teacherName,
      inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      archived: false,
      createdAt: new Date().toISOString(),
    }
    set(K.classrooms, [...list, item])
    return item
  },
  archive(id) {
    set(K.classrooms, get(K.classrooms).map(c => c.id === id ? { ...c, archived: true } : c))
  },
}

// ── Questions ─────────────────────────────────────────────────────────────────
export const questionStore = {
  byId: (id) => get(K.questions).find(q => q.id === id),
  forClassroom: (classroomId) => get(K.questions).filter(q => q.classroomId === classroomId),
  create({ classroomId, title, description, difficulty, constraints, templateCode, language }) {
    const list = get(K.questions)
    const item = {
      id: uid(),
      classroomId,
      title,
      description,
      difficulty: difficulty || 'medium',
      constraints: constraints || [],
      templateCode: templateCode || '',
      language: language || 'javascript',
      createdAt: new Date().toISOString(),
    }
    set(K.questions, [...list, item])
    return item
  },
  update(id, updates) {
    set(K.questions, get(K.questions).map(q => q.id === id ? { ...q, ...updates } : q))
  },
  delete(id) {
    set(K.questions, get(K.questions).filter(q => q.id !== id))
    set(K.submissions, get(K.submissions).filter(s => s.questionId !== id))
  },
}

// ── Enrollments ───────────────────────────────────────────────────────────────
export const enrollmentStore = {
  forClassroom: (classroomId) => get(K.enrollments).filter(e => e.classroomId === classroomId),
  isEnrolled: (classroomId, studentId) =>
    get(K.enrollments).some(e => e.classroomId === classroomId && e.studentId === studentId),
  enroll(classroomId, studentId, studentName) {
    if (this.isEnrolled(classroomId, studentId)) return
    set(K.enrollments, [...get(K.enrollments), {
      classroomId, studentId, studentName, joinedAt: new Date().toISOString(),
    }])
  },
}

// ── Submissions ───────────────────────────────────────────────────────────────
export const submissionStore = {
  forQuestion: (questionId) => get(K.submissions).filter(s => s.questionId === questionId),
  byStudentQuestion: (questionId, studentId) =>
    get(K.submissions).find(s => s.questionId === questionId && s.studentId === studentId),
  upsert({ questionId, classroomId, studentId, studentName, code, feedback }) {
    const list = get(K.submissions)
    const idx = list.findIndex(s => s.questionId === questionId && s.studentId === studentId)
    const item = {
      id: idx >= 0 ? list[idx].id : uid(),
      questionId, classroomId, studentId, studentName, code,
      feedback: feedback || null,
      submittedAt: new Date().toISOString(),
    }
    if (idx >= 0) list[idx] = item; else list.push(item)
    set(K.submissions, list)
    return item
  },
}

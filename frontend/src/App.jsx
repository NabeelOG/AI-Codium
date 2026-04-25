import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage            from './pages/LoginPage'
import RegisterPage         from './pages/RegisterPage'
import JoinPage             from './pages/JoinPage'
import DashboardPage        from './pages/DashboardPage'
import ClassroomManagePage  from './pages/ClassroomManagePage'
import QuestionCreatorPage  from './pages/QuestionCreatorPage'
import AnalyticsPage        from './pages/AnalyticsPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import StudentClassroomPage from './pages/StudentClassroomPage'
import ClassroomPage        from './pages/ClassroomPage'

function RoleRedirect() {
  const token = localStorage.getItem('auth_token')
  if (!token) return <Navigate to="/login" replace />
  const user = (() => { try { return JSON.parse(localStorage.getItem('auth_user')) } catch { return null } })()
  return <Navigate to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/register"   element={<RegisterPage />} />
        <Route path="/join/:code" element={<JoinPage />} />

        {/* Teacher routes */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute role="teacher"><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/teacher/classroom/:id" element={
          <ProtectedRoute role="teacher"><ClassroomManagePage /></ProtectedRoute>
        } />
        <Route path="/teacher/classroom/:id/question/new" element={
          <ProtectedRoute role="teacher"><QuestionCreatorPage /></ProtectedRoute>
        } />
        <Route path="/teacher/classroom/:id/question/:qid/edit" element={
          <ProtectedRoute role="teacher"><QuestionCreatorPage /></ProtectedRoute>
        } />
        <Route path="/teacher/classroom/:id/question/:qid/analytics" element={
          <ProtectedRoute role="teacher"><AnalyticsPage /></ProtectedRoute>
        } />

        {/* Student routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute role="student"><StudentDashboardPage /></ProtectedRoute>
        } />
        <Route path="/student/classroom/:id" element={
          <ProtectedRoute role="student"><StudentClassroomPage /></ProtectedRoute>
        } />
        <Route path="/student/classroom/:id/question/:qid" element={
          <ProtectedRoute role="student"><ClassroomPage /></ProtectedRoute>
        } />

        {/* Fallbacks */}
        <Route path="/dashboard" element={<RoleRedirect />} />
        <Route path="/"          element={<Navigate to="/login" replace />} />
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

import client from './client'

export async function login({ email, password }) {
  const { data } = await client.post('/auth/login', { email, password })
  return data
}

export async function register({ name, email, password, role = 'student' }) {
  const { data } = await client.post('/auth/register', { name, email, password, role })
  return data
}

export async function logout() {
  try { await client.post('/auth/logout') } catch { /* best-effort */ }
}

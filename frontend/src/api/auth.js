import client from './client'
import { mockLoginAPI, mockRegisterAPI } from '../store/mockStore'

export async function login({ email, password }) {
  try {
    const { data } = await client.post('/auth/login', { email, password })
    return data
  } catch (err) {
    if (!err.response) return mockLoginAPI({ email, password })
    throw err
  }
}

export async function register({ name, email, password, role = 'student' }) {
  try {
    const { data } = await client.post('/auth/register', { name, email, password, role })
    return data
  } catch (err) {
    if (!err.response) return mockRegisterAPI({ name, email, password, role })
    throw err
  }
}

export async function logout() {
  try { await client.post('/auth/logout') } catch { /* best-effort */ }
}

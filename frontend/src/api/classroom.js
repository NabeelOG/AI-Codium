import client from './client'

export async function getClassrooms() {
  const { data } = await client.get('/classrooms')
  return data
}

export async function getClassroom(id) {
  const { data } = await client.get(`/classrooms/${id}`)
  return data
}

export async function createClassroom(payload) {
  const { data } = await client.post('/classrooms', payload)
  return data
}

export async function getQuestion(id) {
  const { data } = await client.get(`/questions/${id}`)
  return data
}

export async function submitSolution({ questionId, code, language }) {
  const { data } = await client.post(`/questions/${questionId}/submit`, { code, language })
  return data
}

export async function runCode({ code, language, testCases }) {
  const { data } = await client.post('/run', { code, language, testCases })
  return data
}

export async function getStudentClassrooms() {
    try {
        const { data } = await client.get('/classrooms')
        return data // This already returns only enrolled classrooms for students
    } catch (error) {
        console.error('Failed to fetch student classrooms:', error)
        return []
    }
}

export async function joinClassroom(inviteCode) {
    try {
        const { data } = await client.post(`/join/${inviteCode}`)
        return data
    } catch (error) {
        console.error('Failed to join classroom:', error)
        throw error
    }
}
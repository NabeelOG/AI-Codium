import client from './client'

export async function getClassroomQuestions(classroomId) {
    try {
        const { data } = await client.get(`/classrooms/${classroomId}/questions`)
        return data
    } catch (error) {
        console.error('Failed to fetch questions:', error)
        return []
    }
}

export async function createQuestion(classroomId, payload) {
    const {data} = await client.post(`/classrooms/${classroomId}/questions`, payload)
    return data;
}

export async function updateQuestion(questionId, payload) {
    const {data} = await client.put(`/questions/${questionId}`, payload)
    return data;
}

export async function deleteQuestion(questionId) {
    const {data} = await client.delete(`/questions/${questionId}`)
    return data;
}

export async function getQuestion(questionId) {
  const { data } = await client.get(`/questions/${questionId}`)
  return data
}
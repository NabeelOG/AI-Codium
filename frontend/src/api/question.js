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
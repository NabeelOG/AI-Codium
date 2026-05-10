import client from './client'

export async function getClassroomStudents(classroomId) {
  const { data } = await client.get(`/classrooms/${classroomId}/students`)
  return data
}

import client from './client'

export async function submitCode(questionId, payload) {
  const { data } = await client.post(`/questions/${questionId}/submit`, payload)
  return data
}

export async function getMySubmission(questionId) {
  const { data } = await client.get(`/questions/${questionId}/my-submission`)
  return data
}

export async function getSubmissions(questionId) {
  const { data } = await client.get(`/questions/${questionId}/submissions`)
  return data
}

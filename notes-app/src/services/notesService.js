import api from "../api/axios"

const authenticatedConfig = () => {
  const token = window.localStorage.getItem("token")

  if (!token) {
    throw new Error("Please sign in to access your notes.")
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export const getNotes = async () => {
  const response = await api.get("/notes/get-notes", authenticatedConfig())
  return response.data
}

export const addNote = async (noteData) => {
  const response = await api.post(
    "/notes/add-note",
    noteData,
    authenticatedConfig(),
  )
  return response.data
}

export const updateNote = async (id, noteData) => {
  const response = await api.put(
    `/notes/update-note/${encodeURIComponent(id)}`,
    noteData,
    authenticatedConfig(),
  )
  return response.data
}

export const deleteNote = async (id) => {
  const response = await api.delete(
    `/notes/delete-note/${encodeURIComponent(id)}`,
    authenticatedConfig(),
  )
  return response.data
}

import api from "../api/axios"
import { getAuthConfig } from "./authsservice"

export const getNotes = async () => {
  const response = await api.get("/notes/get-notes", getAuthConfig())
  return response.data
}

export const addNote = async (noteData) => {
  const response = await api.post(
    "/notes/add-note",
    noteData,
    getAuthConfig(),
  )
  return response.data
}

export const updateNote = async (id, noteData) => {
  const response = await api.put(
    `/notes/update-note/${encodeURIComponent(id)}`,
    noteData,
    getAuthConfig(),
  )
  return response.data
}

export const deleteNote = async (id) => {
  const response = await api.delete(
    `/notes/delete-note/${encodeURIComponent(id)}`,
    getAuthConfig(),
  )
  return response.data
}

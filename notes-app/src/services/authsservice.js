import api from "../api/axios"

const TOKEN_KEY = "token"

export const getAuthToken = () => window.localStorage.getItem(TOKEN_KEY)

export const getAuthConfig = () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Please sign in to continue.")
  }
  return { headers: { Authorization: `Bearer ${token}` } }
}

const notifyAuthChanged = () => window.dispatchEvent(new Event("auth-change"))

const getRequestError = (error) =>
  new Error(error.response?.data?.message || "Unable to connect to the server.")

export const signup = async (username, email, password) => {
  try {
    const response = await api.post("/auth/signup", { username, email, password })
    return response.data
  } catch (error) {
    throw getRequestError(error)
  }
}

export const signin = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password })
    const token = response.data?.data?.token
    if (!token) {
      throw new Error(response.data?.message || "Login response did not include a token.")
    }
    window.localStorage.setItem(TOKEN_KEY, token)
    notifyAuthChanged()
    return response.data
  } catch (error) {
    if (error.response) {
      throw getRequestError(error)
    }
    throw error
  }
}

export const signout = () => {
  window.localStorage.removeItem(TOKEN_KEY)
  notifyAuthChanged()
}
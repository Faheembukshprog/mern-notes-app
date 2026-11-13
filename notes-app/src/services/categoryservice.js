import api from "../api/axios"
import { getAuthConfig } from "./authsservice"

export const get_categories = async () => {
    const response = await api.get("/category/get-cat", getAuthConfig())
    return response.data
}

export const add_categories = async (cat_name) => {
    const response = await api.post(
        "/category/add-cat",
        { category_name: cat_name },
        getAuthConfig()
    )
    return response.data
}

export const delete_categories = async (id) => {
    const response = await api.delete(
        `/category/delete_cat/${encodeURIComponent(id)}`,
        getAuthConfig()
    )
    return response.data
}

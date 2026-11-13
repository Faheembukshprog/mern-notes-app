import api from "../api/axios"

 export const get_categories = async ()=>{
    const response  =  await api.get("/category/get-cat")
    console.log(response.data)
    return response.data
}

export const add_categories = async(cat_name)=>{
   let data = {
    category_name : cat_name
   } 
const  res=  await api.post("/category/add-cat", data)
return res.data
}

export const delete_categories = async (id)=>{
    const res =  await api.delete("/category/delete_cat/"+id)

    return res.data
}


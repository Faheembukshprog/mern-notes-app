import React, { useEffect, useState } from 'react'
import {  add_categories ,get_categories ,delete_categories  } from '../services/categoryservice'
import { MdDelete ,MdEdit } from "react-icons/md";


function Category() {
    const [categories,setcategories] = useState([])
    const [cat_name, setCat_name] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)

   async function fetch_categories(){
    setError("")
    try {
      const category_list = await get_categories()
      setcategories(category_list.Cat_list || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to load categories.")
    } finally {
      setIsLoading(false)
    }
  }

  async function add_cat(event){
    event.preventDefault()
    setError("")
    try {
      await add_categories(cat_name)
      setCat_name("")
      await fetch_categories()
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to add category.")
    }
  }

async function delete_category(id) {
  setError("")
  try {
    await delete_categories(id)
    await fetch_categories()
  } catch (requestError) {
    setError(requestError.response?.data?.message || requestError.message || "Unable to delete category.")
  }
}

useEffect(()=>{
    fetch_categories()
},[])

  return (
    <div className='max-w-6xl mx-auto px-6 py-8'>
      <h2 className='text-2xl font-bold'>Categories</h2>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}

      <form 
      onSubmit={add_cat}
      className='bg-white rounded-xl shadow-sm p-5 mt-6 flex gap-2' >

        <input type="text" 
            value={cat_name}
            onChange={(e)=>setCat_name(e.target.value)}
            placeholder='Enter Category Name'
         className=' flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm' />
         
        <button className='bg-green-800 text-white rounded-lg text-sm px-5 py-2'
        type='submit'>Add</button>

      </form>
    
      {isLoading ? (
        <p role="status" className="mt-6">Loading categories…</p>
      ) : (
        <div className="mt-6 grid grid-cols-4 gap-5">
          {categories.map((category) => (
            <div key={category._id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex justify-between">
                <h3>{category.category_name}</h3>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => delete_category(category._id)}
                    aria-label={`Delete ${category.category_name}`}
                    className="text-red-700"
                  >
                    <MdDelete />
                  </button>
                  <MdEdit className="text-green-700" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Category

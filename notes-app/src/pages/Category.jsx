import React, { useEffect, useState } from 'react'
import {  add_categories ,get_categories ,delete_categories  } from '../services/categoryservice'
import { MdDelete ,MdEdit } from "react-icons/md";


function Category() {
    const [categories,setcategories] = useState([])

    const [cat_name, setCat_name] = useState("")

    async function add_cat(){
      const add_cat = await add_categories(cat_name)
      fetch_categories()

    console.log(add_cat)
  }

   async function fetch_categories(){
    const category_list = await get_categories()
    setcategories(category_list.Cat_list)
    }

async function delete_category(id) {
  const done =  await delete_categories(id)
   fetch_categories()
  console.log(done)
}

useEffect(()=>{
    fetch_categories()
},[])

  return (
    <div className='max-w-6xl mx-auto px-6 py-8'>
      <h2 className='text-2xl font-bold'>Categories</h2>

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
    
      <div className='grid grid-cols-4 gap-5 mt-6'>
          {
        categories.map( (c)=>( <div key={c._id} className='bg-white rounded-xl shadow-sm p-5'>

          <div className=' flex justify-between'>
            <h1>{c.category_name}</h1> 
          <span > 
            <MdDelete onClick={()=>delete_category(c._id)} className='text-red-700' />
            <MdEdit className='text-green-700'/>
            </span>
          </div>

        </div> ))
      }
      </div>
    </div>
  )
}

export default Category

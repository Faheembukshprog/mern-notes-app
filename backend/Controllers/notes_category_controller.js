const cat_model =  require("../Models/notes_category_model")
const counter_model = require("../Models/CategoryCounterModel")
const Note_model = require("../Models/NoteModel")
const { nextCategoryId } = require("../utils/categoryId")

const MAX_CATEGORY_NAME_LENGTH = 80

const validCategoryId = (id) => {
    if (!/^[1-9]\d*$/.test(id)) {
        return false
    }
    return Number.isSafeInteger(Number(id))
}

const validCategoryName = (name) =>
    typeof name === "string" &&
    name.trim().length > 0 &&
    name.trim().length <= MAX_CATEGORY_NAME_LENGTH

const add_cat = async(req,res)=>{
    try{
            const {category_name} = req.body || {}
            
            if(!validCategoryName(category_name)){
                return res.status(400).json({
            "status":400,
            "success":false,
            "message": "Category name must be between 1 and 80 characters.",
            "data":[]
        })
            }

            const categoryId = await nextCategoryId(cat_model, counter_model)
            await cat_model.create({
                _id : categoryId,
                category_name:category_name.trim()
            })

            return       res.status(201).json({
            "status":201,
            "success":true,
            "message": "Record added Successfully",
            "data":[]
        })
    }
    catch(e){
      console.error("Failed to create category:", e)
      return  res.status(500).json({
            "status":500,
            "success":false,
            "message": "Unable to create category.",
            "data":[]
        })
    }
}

const get_cat = async(req,res)=>{

    try{
        const data = await cat_model.find()
    return       res.status(201).json({
            "status":200,
            "success":true,
            "message": "Record fetched Successfully",
            "Cat_list":data
        })
    }
    catch(e){
      console.error("Failed to fetch categories:", e)
      return  res.status(500).json({
            "status":500,
            "success":false,
            "message": "Unable to fetch categories.",
            "data":[]
        })
    }
}

const update_api = async(req,res)=>{

     const category_id = req.params.id

     const {category_name} = req.body || {}

     if(!validCategoryId(category_id)){
        return res.status(400).json({
            status:400,
            success:false,
            message:"Invalid category ID",
            data:[]
        })
     }
     if(!validCategoryName(category_name)){
        return res.status(400).json({
            status:400,
            success:false,
            message:"Category name must be between 1 and 80 characters.",
            data:[]
        })
     }

     try{
        const existing_record = await cat_model.findOne({_id:category_id})

        if(!existing_record){
            return res.status(404).json({
            "status":404,
            "success":false,
            "message": "category record  Not Found",
            "data":[]
        })
        }
        else{
            
            await cat_model.updateOne(
                {
                    _id : category_id
                },
              {
                  $set:{
                    category_name : category_name.trim()
                }
              }
            )
                return res.status(200).json({
            "status":200,
            "success":true,
            "message": "Notes Category Record has been Updated",
            "data":[]
        })
        }
     }
     catch(e){
            console.error("Failed to update category:", e)
            return  res.status(500).json({
            "status":500,
            "success":false,
            "message": "Unable to update category.",
            "data":[]
        })
     }
}

const delete_api = async (req,res)=>{
    const category_id =  req.params.id
    if(!validCategoryId(category_id)){
        return res.status(400).json({
            status:400,
            success:false,
            message:"Invalid category ID",
            data:[]
        })
    }

try{
    const notesUsingCategory = await Note_model.countDocuments({
        category: Number(category_id)
    })
    if(notesUsingCategory > 0){
        return res.status(409).json({
            status:409,
            success:false,
            message:"Category cannot be deleted while notes use it.",
            data:[]
        })
    }

    const exsiting_record =  await cat_model.findOne({_id:category_id})

     if(!exsiting_record){
            return res.status(404).json({
            "status":404,
            "success":false,
            "message": "category record  Not Found",
            "data":[]
        })
    }

    await cat_model.deleteOne({_id:category_id})
    return res.status(200).json({
        "status":200,
            "success":true,
            "message": "category has been deleted",
            "data":[]
    })
    
}
catch(e){
    console.error("Failed to delete category:", e)
      return  res.status(500).json({
            "status":500,
            "success":false,
            "message": "Unable to delete category.",
            "data":[]
        })
}
}
module.exports = { add_cat,get_cat,update_api,delete_api}
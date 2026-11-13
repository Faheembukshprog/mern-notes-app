const cat_model =  require("../Models/notes_category_model")

const add_cat = async(req,res)=>{
    try{
            const {category_name} = req.body
            
            if(!category_name){
                return res.status(400).json({
            "status":400,
            "success":false,
            "message": "Category name is required",
            "data":[]
        })
            }

            const count = await cat_model.countDocuments()
            await cat_model.create({
                _id : count +1,
                category_name:category_name
            })

            return       res.status(201).json({
            "status":200,
            "success":true,
            "message": "Record added Successfully",
            "data":[]
        })
    }
    catch(e){
      return  res.status(500).json({
            "status":500,
            "success":false,
            "message": e,
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
      return  res.status(500).json({
            "status":500,
            "success":false,
            "message": e,
            "data":[]
        })
    }
}

const update_api = async(req,res)=>{

     const category_id = req.params.id

     const {category_name} =  req.body

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
                    category_name : category_name
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
            return  res.status(500).json({
            "status":500,
            "success":false,
            "message": e,
            "data":[]
        })
     }
}

const delete_api = async (req,res)=>{
    const category_id =  req.params.id

try{
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
      return  res.status(500).json({
            "status":500,
            "success":false,
            "message": e,
            "data":[]
        })
}
}
module.exports = { add_cat,get_cat,update_api,delete_api}
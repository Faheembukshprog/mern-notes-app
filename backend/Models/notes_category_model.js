const mongoose = require("mongoose")

const cat_schema = mongoose.Schema({

    _id:{
        type:Number,
        required:true
    },
    category_name:{
        type:String,
        required:true
    }
})

const Cat_model = mongoose.model("Notes_category",cat_schema)

module.exports = Cat_model
const moongose = require('mongoose')

const user_schema =  moongose.Schema({
    
    username :{
        type : String,
        required :true
    },
    email : {
        type : String,
        required :true,
        unique :true
    },
    password:{
        type : String,
        required :true
    }
})

const user_model = moongose.model("User",user_schema)

module.exports = user_model
const user_model  = require("../Models/UserModel")
const bcrypt =  require("bcrypt")
const jwt = require("jsonwebtoken")


const signup = async(req,res)=>{
    const {username  , email  , password} = req.body

    try{
        const user_check = await user_model.findOne({email})

    if(user_check){

        return res.status(400).json({
            "status":400,
            "success":false, 
            "message": "User Already exists",
            "data":[]
        })
    }
    
     const hashed_password = await bcrypt.hash(password,10)

     await user_model.create({
        username : username,
        email: email ,
        password : hashed_password
     })

     return res.status(201).json({
            "status":201,
            "success":true,
            "message": "Account Created Successfully",
            "data":[]
        })
    }
    catch (e){
        console.log(e)
        return res.status(500).json({
            "status":500,
            "success":false,
            "message": e,
            "data":[]
        })
    }
}

const signin = async (req,res)=>{
    const {email ,password} = req.body
    try{
        const user = await user_model.findOne({email})

        if(!user){
              return res.status(400).json({
            "status":400,
            "success":false,
            "message": "User Not Found",
            "data":[]
        })
        }
            const is_match = await bcrypt.compare(password,user.password )

            if(!is_match){
                     return res.status(400).json({
            "status":400,
            "success":false,
            "message": "Invalid Credtional",
            "data":[]
        })
            }
        const auth_token =  jwt.sign(
            { id : user._id , username: user.username , email: user.email},
            process.env.JWT_SECRET || process.env.JWTSECRETKEY,
            {expiresIn : '1hr'}
        )

        return res.status(200).json({
            "status":200,
            "success":true,
            "message": "User SignIned Successfully",
            "data":{
                "token" : auth_token
            }
        })
    }
     catch (e){
        console.log(e)
        return res.status(500).json({
            "status":500,
            "success":false,
            "message": e,
            "data":[]
        })
    }
}
module.exports = {signup , signin}
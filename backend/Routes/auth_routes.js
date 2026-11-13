const auth_controlller = require("../Controllers/Auth_controller")
const express =  require("express")


const routes = express.Router()


routes.post("/signup",auth_controlller.signup)
routes.post("/login",auth_controlller.signin)


module.exports =  routes 
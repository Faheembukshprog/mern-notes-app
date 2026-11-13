const express = require("express")
const cat_routes = require("./cat_routes")
const auth_routes =  require("./auth_routes")

const main_routes =  express()

main_routes.use("/category",cat_routes)

main_routes.use("/auth",auth_routes)

module.exports = main_routes
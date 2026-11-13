const cat_controllers = require("../Controllers/notes_category_controller")
const authMiddleware = require("../Middleware/authMiddleware")
const express = require("express")

const route = express.Router()

route.use(authMiddleware)
route.post("/add-cat",cat_controllers.add_cat)
route.get("/get-cat",cat_controllers.get_cat)
route.put("/update_cat/:id",cat_controllers.update_api)
route.delete("/delete_cat/:id",cat_controllers.delete_api)


module.exports = route
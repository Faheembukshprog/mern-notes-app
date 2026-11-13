const express = require("express")
const notes_controller = require("../Controllers/notes_controller")
const authMiddleware = require("../Middleware/authMiddleware")

const routes = express.Router()

routes.use(authMiddleware)
routes.post("/add-note", notes_controller.createNote)
routes.get("/get-notes", notes_controller.getNotes)
routes.put("/update-note/:id", notes_controller.updateNote)
routes.delete("/delete-note/:id", notes_controller.deleteNote)

module.exports = routes

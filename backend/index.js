const mongoose = require('mongoose')
const cors = require('cors')
const express = require("express")
const myenv = require("dotenv") 

const main_routes = require("./Routes/main_route")
const notes_routes = require("./Routes/notes_routes")
const app =  express()
myenv.config()
app.use(cors())
app.use(express.json())

app.use("/api",main_routes)
app.use("/api/notes",notes_routes)

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/notesapp").then(
    ()=>console.log("Db Connected")
).catch(
    (e)=>console.log(e)
)

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})
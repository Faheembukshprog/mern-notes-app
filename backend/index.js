const mongoose = require('mongoose')
const app = require("./app")

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/notesapp").then(
    ()=>console.log("Db Connected")
).catch(
    (e)=>console.log(e)
)

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})
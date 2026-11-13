const cors = require("cors")
const express = require("express")
const main_routes = require("./Routes/main_route")
const notes_routes = require("./Routes/notes_routes")

const app = express()
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(null, false)
    }
}))
app.use(express.json({ limit: "1mb" }))
app.use("/api", main_routes)
app.use("/api/notes", notes_routes)

module.exports = app

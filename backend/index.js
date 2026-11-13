require("dotenv").config()

const mongoose = require('mongoose')
const { loadConfig } = require("./config")

let config
try {
    config = loadConfig(process.env)
} catch (error) {
    console.error(`Startup configuration error: ${error.message}`)
    process.exit(1)
}

const app = require("./app")

const start = async () => {
    try {
        await mongoose.connect(config.mongoUri)
        const server = app.listen(config.port, () => {
            console.log(`Notes API listening on port ${config.port}`)
        })

        const shutdown = async () => {
            server.close()
            await mongoose.disconnect()
        }

        process.once("SIGINT", shutdown)
        process.once("SIGTERM", shutdown)
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message)
        process.exit(1)
    }
}

start()
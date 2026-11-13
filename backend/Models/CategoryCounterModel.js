const mongoose = require("mongoose")

const counter_schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    sequence: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
})

module.exports = mongoose.model("CategoryCounter", counter_schema)

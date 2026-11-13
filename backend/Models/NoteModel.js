const mongoose = require("mongoose")

const note_schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        category: {
            type: Number,
            ref: "Notes_category"
        }
    },
    {
        timestamps: true
    }
)

const Note_model = mongoose.model("Note", note_schema)

module.exports = Note_model

const mongoose = require("mongoose")
const Note_model = require("../Models/NoteModel")
const Category_model = require("../Models/notes_category_model")

const MAX_TITLE_LENGTH = 200
const MAX_CONTENT_LENGTH = 20000

const isValidCategory = (category) =>
    category === null ||
    (Number.isSafeInteger(category) && category > 0)

const invalidRequest = (res, message) =>
    res.status(400).json({
        success: false,
        message
    })

const isPayload = (body) =>
    body !== null && typeof body === "object" && !Array.isArray(body)

const validText = (value, maxLength) =>
    typeof value === "string" && value.trim().length > 0 && value.length <= maxLength

const categoryExists = async (category) =>
    Boolean(await Category_model.exists({ _id: category }))

const createNote = async (req, res) => {
    if (!isPayload(req.body)) {
        return invalidRequest(res, "A valid note payload is required")
    }
    const { title, content, category } = req.body
    const userId = req.user?.userId

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({
            success: false,
            message: "Invalid authenticated user"
        })
    }

    if (!validText(title, MAX_TITLE_LENGTH)) {
        return invalidRequest(res, "Title must be a non-empty string of at most 200 characters")
    }

    if (!validText(content, MAX_CONTENT_LENGTH)) {
        return invalidRequest(res, "Content must be a non-empty string of at most 20000 characters")
    }

    if (category !== undefined && category !== null && !isValidCategory(category)) {
        return invalidRequest(res, "Category must be a positive integer or null")
    }

    try {
        if (category !== undefined && category !== null && !(await categoryExists(category))) {
            return invalidRequest(res, "Category does not exist")
        }

        const note = await Note_model.create({
            userId,
            title: title.trim(),
            content,
            ...(category !== undefined && category !== null ? { category } : {})
        })

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: note
        })
    } catch (error) {
        console.error("Failed to create note:", error)
        return res.status(500).json({
            success: false,
            message: "Unable to create note"
        })
    }
}

const getNotes = async (req, res) => {
    const userId = req.user?.userId

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({
            success: false,
            message: "Invalid authenticated user"
        })
    }

    try {
        const notes = await Note_model.find({ userId }).sort({ updatedAt: -1 })
        return res.status(200).json({
            success: true,
            data: notes
        })
    } catch (error) {
        console.error("Failed to fetch notes:", error)
        return res.status(500).json({
            success: false,
            message: "Unable to fetch notes"
        })
    }
}

const updateNote = async (req, res) => {
    if (!isPayload(req.body)) {
        return invalidRequest(res, "A valid note payload is required")
    }
    const { title, content, category } = req.body
    const { id } = req.params
    const userId = req.user?.userId

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({
            success: false,
            message: "Invalid authenticated user"
        })
    }

    if (!mongoose.isValidObjectId(id)) {
        return invalidRequest(res, "Invalid note ID")
    }

    const setUpdates = {}
    const unsetUpdates = {}
    if (title !== undefined) {
        if (!validText(title, MAX_TITLE_LENGTH)) {
            return invalidRequest(res, "Title must be a non-empty string of at most 200 characters")
        }
        setUpdates.title = title.trim()
    }
    if (content !== undefined) {
        if (!validText(content, MAX_CONTENT_LENGTH)) {
            return invalidRequest(res, "Content must be a non-empty string of at most 20000 characters")
        }
        setUpdates.content = content
    }
    if (category !== undefined) {
        if (!isValidCategory(category)) {
            return invalidRequest(res, "Category must be a positive integer or null")
        }
        if (category === null) {
            unsetUpdates.category = 1
        } else {
            setUpdates.category = category
        }
    }

    if (Object.keys(setUpdates).length === 0 && Object.keys(unsetUpdates).length === 0) {
        return invalidRequest(res, "At least one note field must be provided")
    }

    const update = {}
    if (Object.keys(setUpdates).length > 0) {
        update.$set = setUpdates
    }
    if (Object.keys(unsetUpdates).length > 0) {
        update.$unset = unsetUpdates
    }

    try {
        if (category !== undefined && category !== null && !(await categoryExists(category))) {
            return invalidRequest(res, "Category does not exist")
        }

        const note = await Note_model.findOneAndUpdate(
            { _id: id, userId },
            update,
            { new: true, runValidators: true }
        )

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: note
        })
    } catch (error) {
        console.error("Failed to update note:", error)
        return res.status(500).json({
            success: false,
            message: "Unable to update note"
        })
    }
}

const deleteNote = async (req, res) => {
    const { id } = req.params
    const userId = req.user?.userId

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({
            success: false,
            message: "Invalid authenticated user"
        })
    }

    if (!mongoose.isValidObjectId(id)) {
        return invalidRequest(res, "Invalid note ID")
    }

    try {
        const note = await Note_model.findOneAndDelete({ _id: id, userId })

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        })
    } catch (error) {
        console.error("Failed to delete note:", error)
        return res.status(500).json({
            success: false,
            message: "Unable to delete note"
        })
    }
}

module.exports = { createNote, getNotes, updateNote, deleteNote }

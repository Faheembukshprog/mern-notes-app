const assert = require("node:assert/strict")
const { after, before, test } = require("node:test")
const jwt = require("jsonwebtoken")

process.env.JWT_SECRET = "test-only-secret"

const app = require("../app")
const Note_model = require("../Models/NoteModel")
const notes_controller = require("../Controllers/notes_controller")
const authMiddleware = require("../Middleware/authMiddleware")

const userId = "507f1f77bcf86cd799439011"
const noteId = "507f191e810c19729de860ea"
let server
let baseUrl

before(async () => {
    server = app.listen(0)
    await new Promise((resolve) => server.once("listening", resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
    })
})

const responseRecorder = () => ({
    statusCode: 200,
    body: undefined,
    status(code) {
        this.statusCode = code
        return this
    },
    json(body) {
        this.body = body
        return this
    }
})

test("category and Notes routes reject requests without a JWT", async () => {
    const categoryResponse = await fetch(`${baseUrl}/api/category/get-cat`)
    const notesResponse = await fetch(`${baseUrl}/api/notes/get-notes`)

    assert.equal(categoryResponse.status, 401)
    assert.equal(notesResponse.status, 401)
})

test("CORS only allows configured frontend origins", async () => {
      const allowedResponse = await fetch(`${baseUrl}/api/category/get-cat`, {
          method: "OPTIONS",
          headers: {
              Origin: "http://localhost:5173",
              "Access-Control-Request-Method": "GET"
          }
      })
      const deniedResponse = await fetch(`${baseUrl}/api/category/get-cat`, {
          method: "OPTIONS",
          headers: {
              Origin: "https://untrusted.example",
              "Access-Control-Request-Method": "GET"
          }
      })

      assert.equal(allowedResponse.headers.get("access-control-allow-origin"), "http://localhost:5173")
      assert.equal(deniedResponse.headers.get("access-control-allow-origin"), null)
})

test("auth middleware attaches the verified user ID", async () => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    let nextCalled = false

    authMiddleware(req, responseRecorder(), () => {
        nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.equal(req.user.userId, userId)
})

test("createNote stores the authenticated owner and trimmed title", async () => {
    const originalCreate = Note_model.create
    let document
    Note_model.create = async (value) => {
        document = value
        return { _id: noteId, ...value }
    }

    try {
        const res = responseRecorder()
        await notes_controller.createNote(
            {
                body: { title: "  My note  ", content: "Note content", category: 2 },
                user: { userId }
            },
            res
        )
        assert.deepEqual(document, {
            userId,
            title: "My note",
            content: "Note content",
            category: 2
        })
        assert.equal(res.statusCode, 201)
    } finally {
        Note_model.create = originalCreate
    }
})

test("getNotes filters the query by authenticated user", async () => {
    const originalFind = Note_model.find
    let query
    const expectedNotes = [{ _id: noteId, title: "Private note" }]
    Note_model.find = (filter) => {
        query = filter
        return { sort: async () => expectedNotes }
    }

    try {
        const res = responseRecorder()
        await notes_controller.getNotes({ user: { userId } }, res)
        assert.deepEqual(query, { userId })
        assert.deepEqual(res.body.data, expectedNotes)
        assert.equal(res.statusCode, 200)
    } finally {
        Note_model.find = originalFind
    }
})

test("updateNote includes both note ID and owner in its database filter", async () => {
    const originalUpdate = Note_model.findOneAndUpdate
    let filter
    Note_model.findOneAndUpdate = async (criteria) => {
        filter = criteria
        return { _id: noteId, title: "Updated" }
    }

    try {
        const res = responseRecorder()
        await notes_controller.updateNote(
            { params: { id: noteId }, body: { title: "Updated" }, user: { userId } },
            res
        )
        assert.deepEqual(filter, { _id: noteId, userId })
        assert.equal(res.statusCode, 200)
    } finally {
        Note_model.findOneAndUpdate = originalUpdate
    }
})

test("deleteNote includes both note ID and owner in its database filter", async () => {
    const originalDelete = Note_model.findOneAndDelete
    let filter
    Note_model.findOneAndDelete = async (criteria) => {
        filter = criteria
        return { _id: noteId }
    }

    try {
        const res = responseRecorder()
        await notes_controller.deleteNote(
            { params: { id: noteId }, user: { userId } },
            res
        )
        assert.deepEqual(filter, { _id: noteId, userId })
        assert.equal(res.statusCode, 200)
    } finally {
        Note_model.findOneAndDelete = originalDelete
    }
})

const assert = require("node:assert/strict")
const { after, before, test } = require("node:test")
const jwt = require("jsonwebtoken")

process.env.NODE_ENV = "test"
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/notesapp-test"
process.env.JWT_SECRET = "test-only-secret"
process.env.CORS_ORIGIN = "http://localhost:5173,https://notes.example.com"

const app = require("../app")
const Note_model = require("../Models/NoteModel")
const Category_model = require("../Models/notes_category_model")
const User_model = require("../Models/UserModel")
const category_controller = require("../Controllers/notes_category_controller")
const bcrypt = require("bcrypt")
const auth_controller = require("../Controllers/Auth_controller")
const notes_controller = require("../Controllers/notes_controller")
const authMiddleware = require("../Middleware/authMiddleware")
const { loadConfig } = require("../config")
const { nextCategoryId } = require("../utils/categoryId")

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
      const productionOriginResponse = await fetch(`${baseUrl}/api/category/get-cat`, {
          method: "OPTIONS",
          headers: {
              Origin: "https://notes.example.com",
              "Access-Control-Request-Method": "GET"
          }
      })

      assert.equal(allowedResponse.headers.get("access-control-allow-origin"), "http://localhost:5173")
      assert.equal(deniedResponse.headers.get("access-control-allow-origin"), null)
      assert.equal(productionOriginResponse.headers.get("access-control-allow-origin"), "https://notes.example.com")
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

test("startup configuration rejects missing MongoDB URI and JWT secret", () => {
    assert.throws(
        () => loadConfig({ NODE_ENV: "production" }),
        { name: "ConfigurationError", message: /MONGO_URI.*JWT_SECRET/ }
    )
})

test("startup configuration rejects placeholder or weak secrets outside test", () => {
    assert.throws(
        () => loadConfig({
            NODE_ENV: "production",
            MONGO_URI: "mongodb://localhost:27017/notesapp",
            JWT_SECRET: "replace-with-a-secret"
        }),
        { name: "ConfigurationError", message: /JWT_SECRET must be a non-placeholder/ }
    )
})

test("startup configuration rejects malformed MongoDB connection strings", () => {
    assert.throws(
        () => loadConfig({
            NODE_ENV: "production",
            MONGO_URI: "https://example.com/db",
            JWT_SECRET: "a-secure-secret-value-longer-than-thirty-two-characters"
        }),
        { name: "ConfigurationError", message: /MONGO_URI must be configured/ }
    )
})

test("production configuration requires a non-loopback frontend CORS origin", () => {
    const productionEnv = {
        NODE_ENV: "production",
        MONGO_URI: "mongodb+srv://cluster0.mongodb.net/notesapp",
        JWT_SECRET: "a-secure-secret-value-longer-than-thirty-two-characters"
    }

    assert.throws(
        () => loadConfig(productionEnv),
        { name: "ConfigurationError", message: /CORS_ORIGIN must include/ }
    )
    assert.throws(
        () => loadConfig({ ...productionEnv, CORS_ORIGIN: "http://localhost:5173" }),
        { name: "ConfigurationError", message: /CORS_ORIGIN must contain/ }
    )
    assert.deepEqual(
        loadConfig({ ...productionEnv, CORS_ORIGIN: "https://notes.example.com" }).corsOrigins,
        ["https://notes.example.com"]
    )
})

test("signup rejects empty payloads before database access", async () => {
    let databaseCalled = false
    const originalFindOne = User_model.findOne
    User_model.findOne = async () => {
        databaseCalled = true
        return null
    }

    try {
        const res = responseRecorder()
        await auth_controller.signup({ body: { username: " ", email: "", password: "" } }, res)
        assert.equal(res.statusCode, 400)
        assert.equal(res.body.success, false)
        assert.equal(databaseCalled, false)
    } finally {
        User_model.findOne = originalFindOne
    }
})

test("signup trims user fields, normalizes email, and preserves password", async () => {
    const originalFindOne = User_model.findOne
    const originalCreate = User_model.create
    const originalHash = bcrypt.hash
    let savedUser
    let hashedValue
    User_model.findOne = async () => null
    User_model.create = async (value) => {
        savedUser = value
    }
    bcrypt.hash = async (value) => {
        hashedValue = value
        return "hashed-password"
    }

    try {
        const res = responseRecorder()
        await auth_controller.signup({
            body: {
                username: "  Alice  ",
                email: "  Alice@Example.com ",
                password: "  long secure password  "
            }
        }, res)
        assert.equal(res.statusCode, 201)
        assert.equal(savedUser.username, "Alice")
        assert.equal(savedUser.email, "alice@example.com")
        assert.equal(savedUser.password, "hashed-password")
        assert.equal(hashedValue, "  long secure password  ")
    } finally {
        User_model.findOne = originalFindOne
        User_model.create = originalCreate
        bcrypt.hash = originalHash
    }
})

test("login uses the same generic response for unknown users and wrong passwords", async () => {
    const originalFindOne = User_model.findOne
    const originalCompare = bcrypt.compare
    let user = null
    User_model.findOne = async () => user
    bcrypt.compare = async () => false

    try {
        const unknownUserResponse = responseRecorder()
        await auth_controller.signin({
            body: { email: "alice@example.com", password: "long-password-123" }
        }, unknownUserResponse)

        user = { password: "stored-hash" }
        const wrongPasswordResponse = responseRecorder()
        await auth_controller.signin({
            body: { email: "alice@example.com", password: "long-password-123" }
        }, wrongPasswordResponse)

        assert.equal(unknownUserResponse.statusCode, 401)
        assert.equal(wrongPasswordResponse.statusCode, 401)
        assert.equal(unknownUserResponse.body.message, "Invalid email or password.")
        assert.equal(wrongPasswordResponse.body.message, unknownUserResponse.body.message)
    } finally {
        User_model.findOne = originalFindOne
        bcrypt.compare = originalCompare
    }
})

test("category ID allocation is unique under concurrent requests and advances above existing IDs", async () => {
    let sequence
    const categoryModel = {
        findOne() {
            return {
                sort() {
                    return this
                },
                async lean() {
                    return { _id: 20 }
                }
            }
        }
    }
    const counterModel = {
        async updateOne(filter, update, options = {}) {
            if (sequence === undefined && !options.upsert) {
                const error = new Error("duplicate key")
                error.code = 11000
                throw error
            }
            sequence = Math.max(sequence || 0, update.$max.sequence)
        },
        async findOneAndUpdate(_filter, update) {
            sequence += update.$inc.sequence
            return { sequence }
        }
    }

    const ids = await Promise.all(
        Array.from({ length: 25 }, () => nextCategoryId(categoryModel, counterModel))
    )
    assert.equal(new Set(ids).size, ids.length)
    assert.equal(Math.min(...ids), 21)
    assert.equal(Math.max(...ids), 45)
})

test("category ID allocator handles a concurrent counter initialization race", async () => {
    let updateCalls = 0
    let sequence = 0
    const categoryModel = {
        findOne() {
            return {
                sort() {
                    return this
                },
                async lean() {
                    return { _id: 6 }
                }
            }
        }
    }
    const counterModel = {
        async updateOne(_filter, update, options = {}) {
            updateCalls += 1
            if (options.upsert) {
                const error = new Error("duplicate key")
                error.code = 11000
                throw error
            }
            sequence = Math.max(sequence, update.$max.sequence)
        },
        async findOneAndUpdate(_filter, update) {
            sequence += update.$inc.sequence
            return { sequence }
        }
    }

    assert.equal(await nextCategoryId(categoryModel, counterModel), 7)
    assert.equal(updateCalls, 2)
})

test("category creation rejects blank or oversized names", async () => {
    const originalFindOne = Category_model.findOne
    Category_model.findOne = () => {
        throw new Error("Invalid category payload reached ID allocation")
    }

    try {
        for (const category_name of [" ", "x".repeat(81)]) {
            const res = responseRecorder()
            await category_controller.add_cat({ body: { category_name } }, res)
            assert.equal(res.statusCode, 400)
        }
    } finally {
        Category_model.findOne = originalFindOne
    }
})

test("category deletion refuses to orphan notes", async () => {
    const originalCountDocuments = Note_model.countDocuments
    const originalFindOne = Category_model.findOne
    let categoryLookupCalled = false
    Note_model.countDocuments = async () => 1
    Category_model.findOne = async () => {
        categoryLookupCalled = true
        return { _id: 2 }
    }

    try {
        const res = responseRecorder()
        await category_controller.delete_api({ params: { id: "2" } }, res)
        assert.equal(res.statusCode, 409)
        assert.equal(categoryLookupCalled, false)
    } finally {
        Note_model.countDocuments = originalCountDocuments
        Category_model.findOne = originalFindOne
    }
})

test("createNote stores the authenticated owner and trimmed title", async () => {
    const originalCreate = Note_model.create
    const originalCategoryExists = Category_model.exists
    let document
    Note_model.create = async (value) => {
        document = value
        return { _id: noteId, ...value }
    }
    Category_model.exists = async () => ({ _id: 2 })

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
        Category_model.exists = originalCategoryExists
    }
})

test("createNote rejects oversized content and invalid category references", async () => {
    const originalCategoryExists = Category_model.exists
    let categoryLookupCount = 0
    Category_model.exists = async () => {
        categoryLookupCount += 1
        return null
    }

    try {
        const oversizedResponse = responseRecorder()
        await notes_controller.createNote({
            body: { title: "Title", content: "x".repeat(20001) },
            user: { userId }
        }, oversizedResponse)
        assert.equal(oversizedResponse.statusCode, 400)
        assert.equal(categoryLookupCount, 0)

        const missingCategoryResponse = responseRecorder()
        await notes_controller.createNote({
            body: { title: "Title", content: "Text", category: 99 },
            user: { userId }
        }, missingCategoryResponse)
        assert.equal(missingCategoryResponse.statusCode, 400)
        assert.equal(missingCategoryResponse.body.message, "Category does not exist")
        assert.equal(categoryLookupCount, 1)
    } finally {
        Category_model.exists = originalCategoryExists
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

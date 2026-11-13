const user_model = require("../Models/UserModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_PASSWORD_LENGTH = 12
const MAX_BCRYPT_BYTES = 72

const invalidRequest = (res, message) =>
    res.status(400).json({
        status: 400,
        success: false,
        message,
        data: []
    })

const normalizeEmail = (email) =>
    typeof email === "string" ? email.trim().toLowerCase() : ""

const validateCredentials = (email, password) => {
    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
        return "A valid email address is required."
    }

    if (typeof password !== "string" || password.trim().length === 0) {
        return "Password is required."
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
    }

    if (Buffer.byteLength(password, "utf8") > MAX_BCRYPT_BYTES) {
        return "Password must not exceed 72 UTF-8 bytes."
    }

    return null
}

const signup = async (req, res) => {
    const body = req.body
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return invalidRequest(res, "A valid signup payload is required.")
    }

    const username = typeof body.username === "string" ? body.username.trim() : ""
    const email = normalizeEmail(body.email)
    const { password } = body

    if (username.length < 2 || username.length > 50) {
        return invalidRequest(res, "Username must be between 2 and 50 characters.")
    }

    const validationError = validateCredentials(email, password)
    if (validationError) {
        return invalidRequest(res, validationError)
    }

    try {
        const existingUser = await user_model.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                status: 409,
                success: false,
                message: "An account with this email already exists.",
                data: []
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await user_model.create({
            username,
            email,
            password: hashedPassword
        })

        return res.status(201).json({
            status: 201,
            success: true,
            message: "Account created successfully.",
            data: []
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                status: 409,
                success: false,
                message: "An account with this email already exists.",
                data: []
            })
        }
        console.error("Signup failed:", error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Unable to create account.",
            data: []
        })
    }
}

const signin = async (req, res) => {
    const body = req.body
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return invalidRequest(res, "A valid login payload is required.")
    }

    const email = normalizeEmail(body.email)
    const { password } = body
    const validationError = validateCredentials(email, password)
    if (validationError) {
        return invalidRequest(res, validationError)
    }

    try {
        const user = await user_model.findOne({ email })
        const passwordMatches = user
            ? await bcrypt.compare(password, user.password)
            : false

        if (!passwordMatches) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: "Invalid email or password.",
                data: []
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Signed in successfully.",
            data: { token }
        })
    } catch (error) {
        console.error("Login failed:", error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Unable to sign in.",
            data: []
        })
    }
}

module.exports = { signup, signin }

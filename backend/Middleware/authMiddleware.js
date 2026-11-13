const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization token is required"
        })
    }

    const token = authorization.slice("Bearer ".length).trim()
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authorization token is required"
        })
    }

    const secret = process.env.JWT_SECRET || process.env.JWTSECRETKEY
    if (!secret) {
        return res.status(500).json({
            success: false,
            message: "Authentication is not configured"
        })
    }

    try {
        const decoded = jwt.verify(token, secret)
        const userId = decoded.userId || decoded.id

        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "Invalid authorization token"
            })
        }

        req.user = { ...decoded, userId }
        return next()
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired authorization token"
        })
    }
}

module.exports = authMiddleware

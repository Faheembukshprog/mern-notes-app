const isPlaceholder = (value) =>
    /(replace|change[-_ ]?me|your[-_ ]|example|test[-_ ]?only)/i.test(value)

const isMongoConnectionString = (value) => {
    try {
        const parsed = new URL(value)
        return ["mongodb:", "mongodb+srv:"].includes(parsed.protocol) && Boolean(parsed.hostname)
    } catch {
        return false
    }
}

const parseCorsOrigins = (value) => {
    if (typeof value !== "string" || !value.trim()) {
        return []
    }

    return value.split(",").map((origin) => origin.trim()).filter(Boolean)
}

const isValidCorsOrigin = (origin, production) => {
    try {
        const parsed = new URL(origin)
        const isWebOrigin = ["http:", "https:"].includes(parsed.protocol) &&
            parsed.origin === origin
        const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)
        return isWebOrigin && !(production && isLoopback)
    } catch {
        return false
    }
}

const loadConfig = (env = process.env) => {
    const errors = []
    const mongoUri = typeof env.MONGO_URI === "string" ? env.MONGO_URI.trim() : ""
    const jwtSecret = typeof env.JWT_SECRET === "string" ? env.JWT_SECRET.trim() : ""
    const isTest = env.NODE_ENV === "test"
    const isProduction = env.NODE_ENV === "production"
    const corsOrigins = parseCorsOrigins(env.CORS_ORIGIN)

    if (!mongoUri || isPlaceholder(mongoUri) || !isMongoConnectionString(mongoUri)) {
        errors.push("MONGO_URI must be configured with a valid MongoDB connection string.")
    }

    if (!jwtSecret) {
        errors.push("JWT_SECRET must be configured.")
    } else if (!isTest && (jwtSecret.length < 32 || isPlaceholder(jwtSecret))) {
        errors.push("JWT_SECRET must be a non-placeholder secret of at least 32 characters.")
    }

    if (isProduction && corsOrigins.length === 0) {
        errors.push("CORS_ORIGIN must include the production frontend origin.")
    } else if (corsOrigins.some((origin) => !isValidCorsOrigin(origin, isProduction))) {
        errors.push("CORS_ORIGIN must contain only valid web origins without paths.")
    }

    if (errors.length > 0) {
        const error = new Error(errors.join(" "))
        error.name = "ConfigurationError"
        throw error
    }

    return {
        mongoUri,
        jwtSecret,
        corsOrigins: corsOrigins.length > 0 ? corsOrigins : ["http://localhost:5173"],
        port: env.PORT || 3000
    }
}

module.exports = { loadConfig }

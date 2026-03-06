require("dotenv").config();
const path = require("path");
const fastify = require("fastify")({ logger: true });

// plugins
fastify.register(require("@fastify/cors"), {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
});

fastify.register(require("@fastify/sensible"));

fastify.register(require("@fastify/multipart"), {
    attachFieldsToBody: false,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// static files locally only
if (process.env.NODE_ENV !== "production") {
    const fs = require("fs");

    const uploadsDir = path.join(__dirname, "uploads", "thumbnails");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    fastify.register(require("@fastify/static"), {
        root: path.join(__dirname, "uploads"),
        prefix: "/uploads/",
    });

    fastify.register(require("@fastify/static"), {
        root: path.join(__dirname, "public"),
        prefix: "/",
        decorateReply: false
    });
}

// env
fastify.register(require("@fastify/env"), {
    dotenv: true,
    schema: {
        type: "object",
        required: ["MONGODB_URI", "JWT_TOKEN"],
        properties: {
            PORT: { type: "string", default: "3000" },
            MONGODB_URI: { type: "string" },
            JWT_TOKEN: { type: "string" }
        }
    }
});

// custom plugins
fastify.register(require("./plugins/mongoDb.js"));
fastify.register(require("./plugins/jwt.js"));

// routes
fastify.register(require("./routes/auth.js"), { prefix: "/api/auth" });
fastify.register(require("./routes/thumbnail.js"), { prefix: "/api/thumbnail" });

// health check
fastify.get("/test-db", async (request, reply) => {
    try {
        const mongoose = fastify.mongoose;
        const states = ["disconnected", "connected", "connecting", "disconnecting"];
        reply.send({ database: states[mongoose.connection.readyState] || "unknown" });
    } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ error: "failed to test database!" });
    }
});

// local server (NOT used by Vercel)
if (require.main === module) {
    const start = async () => {
        try {
            await fastify.listen({ port: process.env.PORT || 3000 });
            fastify.log.info(`Server running at http://localhost:${process.env.PORT || 3000}`);
        } catch (err) {
            fastify.log.error(err);
            process.exit(1);
        }
    };
    start();
}

module.exports = fastify;
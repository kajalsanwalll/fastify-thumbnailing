require("dotenv").config();
const path = require("path");
const fastify = require("fastify")({ logger: true });

// register plugins
fastify.register(require("@fastify/cors"), {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
});

fastify.register(require("@fastify/sensible"));

fastify.register(require("@fastify/multipart"), {
    attachFieldsToBody: false,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB
    }
});

// Only serve static files locally — Vercel has no local filesystem
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

fastify.register(require("@fastify/env"), {
    dotenv: true,
    schema: {
        type: "object",
        required: ["MONGODB_URI", "JWT_TOKEN"],  // removed PORT — Vercel sets its own
        properties: {
            PORT:        { type: "string", default: "3000" },
            MONGODB_URI: { type: "string" },
            JWT_TOKEN:   { type: "string" }
        }
    }
});

// register custom plugins
fastify.register(require("./plugins/mongoDb.js"));
fastify.register(require("./plugins/jwt.js"));

// register routes
fastify.register(require("./routes/auth.js"),      { prefix: "/api/auth" });
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
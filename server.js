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

// serve frontend
fastify.register(require("@fastify/static"), {
    root: path.join(__dirname, "public"),
    prefix: "/"
});

// root route
fastify.get("/", async (req, reply) => {
    return reply.sendFile("index.html");
});

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

if (require.main === module) {
    const start = async () => {
        try {
            await fastify.listen({ port: process.env.PORT || 3000 });
        } catch (err) {
            fastify.log.error(err);
            process.exit(1);
        }
    };
    start();
}

module.exports = fastify;
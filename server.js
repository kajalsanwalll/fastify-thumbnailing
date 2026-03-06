require("dotenv").config();
const path = require("path");
const fastify = require("fastify")({ logger: true });

// plugins
fastify.register(require("@fastify/cors"), {
  origin: true
});

fastify.register(require("@fastify/sensible"));

fastify.register(require("@fastify/multipart"), {
  limits: {
    fileSize: 10 * 1024 * 1024
  }
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

// plugins
fastify.register(require("./plugins/mongodb"));
fastify.register(require("./plugins/jwt"));

// routes
fastify.register(require("./routes/auth"), { prefix: "/api/auth" });
fastify.register(require("./routes/thumbnail"), { prefix: "/api/thumbnail" });

// test route
fastify.get("/", async () => {
  return { message: "Fastify running on Vercel 🚀" };
});

fastify.get("/test-db", async (request, reply) => {
  const mongoose = fastify.mongoose;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return { database: states[mongoose.connection.readyState] || "unknown" };
});

// local dev only
if (require.main === module) {
  fastify.listen({ port: process.env.PORT || 3000 }, (err) => {
    if (err) throw err;
    console.log("Server running locally");
  });
}

module.exports = fastify;
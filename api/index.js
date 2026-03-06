const fastify = require("../server");

module.exports = async (req, res) => {
  await fastify.ready();
  fastify.server.emit("request", req, res);
};
const authControllers = require("../controllers/authController.js");

module.exports = async function (fastify, opts){

    fastify.post("/register", authControllers.register);
    fastify.post("/login", authControllers.login)
    fastify.post("/forgot-password", authControllers.forgotPassword)
    fastify.post("/reset-password/:token", authControllers.resetPassword)
    fastify.post("/logout",{preHandler: [fastify.authenticate]} ,authControllers.logout)

}

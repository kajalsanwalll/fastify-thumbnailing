const fp = require("fastify-plugin");
const { register } = require("../controllers/authController");

module.exports = fp(async function (fastify, opts) {
    fastify.register(register("@fastify/jwt"),{
        secret: process.env.JWT_SECRET,
    })

    fastify.decorate("authenticate", async function (request, reply){
       
        //this is middleware actually
        try {
            await request.jwtVerify();

        } catch (err) {
            reply.send(err)
        }

    })
})
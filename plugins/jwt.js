const fp = require("fastify-plugin");
const fastifyJwt = require("@fastify/jwt");

module.exports = fp(async function (fastify, opts) {
    fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET,
    });


    fastify.decorate("authenticate", async function (request, reply){
       
        //this is middleware actually
        try {
            await request.jwtVerify();

        } catch (err) {
            reply.send(err)
        }

    })
})
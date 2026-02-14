require("dotenv").config();
const path = require("path");
const fastifyEnv = require("@fastify/env")
const fastify = require("fastify")({logger:true})


//register plugins
fastify.register(require("@fastify/cors"))
fastify.register(require("@fastify/sensible"))
fastify.register(require("@fastify/env"),{
    dotenv: true,
    schema:{
        type: "object",
        required: ["PORT", "MONGODB_URI", "JWT_TOKEN"],
        properties: {
            PORT:{
                type: "string", default:3000
            },
            MONGODB_URI:{type: "string"},
            JWT_TOKEN:{type: "string"}
        }
    }
})



//Declare a route
fastify.get('/', function(request, reply){
    reply.send({hello: 'world'})
})

//fastify env ke liye
/* const schema = {
    type: "object",
    required: ["PORT", "MONGODB_URI"],
    properties: {
        PORT:{
            type: "string",
            default: 4000,
        },
        MONGODB_URI:{

        }
    }
}

const options = {
    confKey: "config",
    schema: schema,
    data: data,
};

fastify.register(fastifyEnv, options).ready((err) => {
    if(err) console.error(err);

    console.log(fastify.config);
    console.log(fastify.getEnvs());
    // output will be on port 4000 as it should be !
})
*/

const start = async () => {
    try {
        await fastify.listen({port: process.env.PORT})
        fastify.log.info(
            `Server is running at http://localhost:${process.env.PORT}`
        )
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start();
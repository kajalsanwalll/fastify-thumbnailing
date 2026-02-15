const thumbnailController = require("../controllers/thumbnailController.js");

module.exports = async function (fastify, opts){
    fastify.register(async function(fastify){
        fastify.addHook("preHandler", fastify.authenticate);

       fastify.post("/", thumbnailController.createThumbnail)
       fastify.get("/", thumbnailController.getThumbnails)
       fastify.get("/:id", thumbnailController.getThumbnail)
       fastify.put("/:id", thumbnailController.updateThumbnail)
       fastify.delete("/:id", thumbnailController.deleteThumbnail)
       fastify.delete("/", thumbnailController.deleteAllThumbnails)


    })
}
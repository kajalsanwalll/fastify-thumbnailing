const Thumbnail = require("../models/thumbnail.js");
const path = require("path");
const fs = require("fs");
const {pipeline} = require("stream");
const util = require("util");
const { request } = require("http");
const { default: fastify } = require("fastify");
const pipelineAsync = util.promisify(pipeline)

exports.createThumbnail = async (request, reply) => {

    try {
        
        const parts = request.parts
        ();

        let fields = {};
        let filename;

        for await(const part of parts){

            if(part.file){

                filename =`${Date.now()}-${part.filename}`
                const saveTo = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    "thumbnails",
                    filename
                );

                await pipelineAsync(part.file, fs.createWriteStream(saveTo))

            } else {
                fields[part.filename] = part.value
            }
        }

        const thumbnail = new Thumbnail({
            user: request.user.id,
            videoName: fields.videoName,
            version: fields.version,
            image: `/uploads/thumbnails/${filename}`,
            paid: fields.paid === "true"
        })

        await thumbnail.save()
        reply.code(201).send(thumbnail)

    } catch (err) {
        reply.send(err)
    }

}

exports.getThumbnails = async (request, reply) => {

    try {

        const thumbnails = await Thumbnail.find({user: request.user.id})
        

    } catch (err) {
        reply.send(err)
    }
}

exports.getThumbnail = async (request, reply) => {

    try {
        
        const thumbnail = await Thumbnail.findOne({
            _id: request.params.id,
            user: request.user.id
        })

        if(!thumbnail){
            return reply.notFound("thumbnail not found!")
        }

        reply.send(thumbnail)

    } catch (err) {
        reply.send(err)
    }
}

exports.updateThumbnail = async (request, reply) => {

    try {

        const updatedData = request.body
        const thumbnail = await Thumbnail.findByIdAndUpdate(

            {
                _id: request.params.id, user: request.user.id
            },
            updatedData,
            {
                new:true
            }
        )

        if(!thumbnail){
            return reply.notFound("thumbnail not found!")
        }

        reply.send(thumbnail)
        


    } catch (err) {
        reply.send(err)
    }

}

exports.deleteThumbnail = async(request, reply) => {

    try {
        
        const thumbnail = await Thumbnail.findByIdAndDelete(
            {
                _id: request.params.id, user: request.user.id
            }
        )

        if(!thumbnail){
            return reply.notFound("thumbnail not found!")
        }

        const filepath = path.join(
            __dirname,
            "..",
            "uploads",
            "thumbnails",
            path.basename(thumbnail.image)
        );

        fs.unlink(filepath, (err) => {
            if(err) fastify.log.error(err)
        })
         
        reply.send({message: "thumbnail deleted!"})

    } catch (err) {
        reply.send(err)
    }

}

exports.deleteAllThumbnails = async (request, reply) => {

    try {
        
        const thumbnails = await Thumbnail.find({
            user: request.user.id
        })

        await Thumbnail.deleteMany({user: request.user.id})

        for(const thumbnail of thumbnails){
            const filepath = path.join(
            __dirname,
            "..",
            "uploads",
            "thumbnails",
            path.basename(thumbnail.image)
            );

            fs.unlink(filepath, (err) => {
             if(err) fastify.log.error(err)
            })
        }

        reply.send({message: "All thumbnails deleted!"})


    } catch (err) {
        reply.send(err)
    }
}
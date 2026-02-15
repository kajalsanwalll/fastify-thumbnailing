const Thumbnail = require("../models/thumbnail.js");
const path = require("path");
const fs = require("fs");
const {pipeline} = require("stream");
const util = require("util");
const pipelineAsync = util.promisify(pipeline)

exports.createThumbnail = async (request, reply) => {

    try {
        
        const parts = request.part();

        let fields = {};
        let filename;

        for await(const part of parts){

            if(part.file){

                const filename =`${Date.now()}-${part.filename}`
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
const Thumbnail = require("../models/thumbnail.js");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Cloudinary reads these env vars automatically:
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

// Helper: upload a buffer to Cloudinary via stream
function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "thumbify" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

exports.createThumbnail = async (request, reply) => {
    try {
        const parts = request.parts();

        let fields = {};
        let imageUrl;
        let publicId;

        for await (const part of parts) {
            if (part.file) {
                // Buffer the stream, then upload to Cloudinary
                const chunks = [];
                for await (const chunk of part.file) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                const result = await uploadToCloudinary(buffer);
                imageUrl = result.secure_url;  // permanent https URL
                publicId = result.public_id;   // needed to delete later
            } else {
                fields[part.fieldname] = part.value;
            }
        }

        if (!imageUrl) {
            return reply.badRequest("No image file provided");
        }

        const thumbnail = new Thumbnail({
            user: request.user.id,
            videoName: fields.videoName,
            version: fields.version,
            image: imageUrl,
            publicId: publicId,
            paid: fields.paid === "true"
        });

        await thumbnail.save();
        reply.code(201).send(thumbnail);

    } catch (err) {
        reply.send(err);
    }
};

exports.getThumbnails = async (request, reply) => {
    try {
        const thumbnails = await Thumbnail.find({ user: request.user.id });
        reply.send(thumbnails);
    } catch (err) {
        reply.send(err);
    }
};

exports.getThumbnail = async (request, reply) => {
    try {
        const thumbnail = await Thumbnail.findOne({
            _id: request.params.id,
            user: request.user.id
        });

        if (!thumbnail) {
            return reply.notFound("thumbnail not found!");
        }

        reply.send(thumbnail);
    } catch (err) {
        reply.send(err);
    }
};

exports.updateThumbnail = async (request, reply) => {
    try {
        const updatedData = request.body;
        const thumbnail = await Thumbnail.findOneAndUpdate(
            { _id: request.params.id, user: request.user.id },
            updatedData,
            { new: true }
        );

        if (!thumbnail) {
            return reply.notFound("thumbnail not found!");
        }

        reply.send(thumbnail);
    } catch (err) {
        reply.send(err);
    }
};

exports.deleteThumbnail = async (request, reply) => {
    try {
        const thumbnail = await Thumbnail.findOneAndDelete({
            _id: request.params.id,
            user: request.user.id
        });

        if (!thumbnail) {
            return reply.notFound("thumbnail not found!");
        }

        // Delete from Cloudinary too
        if (thumbnail.publicId) {
            await cloudinary.uploader.destroy(thumbnail.publicId);
        }

        reply.send({ message: "thumbnail deleted!" });
    } catch (err) {
        reply.send(err);
    }
};

exports.deleteAllThumbnails = async (request, reply) => {
    try {
        const thumbnails = await Thumbnail.find({ user: request.user.id });

        await Thumbnail.deleteMany({ user: request.user.id });

        // Delete all from Cloudinary in parallel
        await Promise.all(
            thumbnails
                .filter(t => t.publicId)
                .map(t => cloudinary.uploader.destroy(t.publicId))
        );

        reply.send({ message: "All thumbnails deleted!" });
    } catch (err) {
        reply.send(err);
    }
};
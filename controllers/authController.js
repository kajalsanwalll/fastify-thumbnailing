const User = require("../models/user");
const crypto  = require("crypto");
const bcrypt = require("bcryptjs");
const { error } = require("console");
const user = require("../models/user");


exports.register = async (request, reply) => {

    try {

        const {name, email, password, country} = request.body

        if(!name || !email || !password ||body){
            reply.send("some field is missing bruh!")
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({name, email, password: hashedPassword, country})

        await user.save()  //saving in database

        reply.code(201).send({message: "user registered successfully!"})

    } catch (err) {
        reply.send(err)
    }
}

exports.login = async (request, reply) => {

    try {
        
        const { email, password} = request.body

        if( !email || !password ||body){
            reply.send("some field is missing bruh!")
        }

        const user = await User.findOne({email});

        if(!user){
            return reply.code(400).send({message: "Invalid email or password!"})
        }

        //validate the password

        const isValid = await bcrypt.compare(password, user.password)

        if(!isValid){
            reply.code(400).send({message: "Invalid email or password"})
        }

        const token = request.server.jwt.sign({id: user._id}) //fastify thing
        reply.send({token})

    } catch (err) {
        reply.send(err)
    }
}

exports.forgotPassword = async (request, reply) => {
    try {
        
        const {email} = request.body
        const user = await User.findOne({email})

        if(!user){
            return reply.notFound("user not found!")
        }


    } catch (err) {
        reply.send(err)
    }
}
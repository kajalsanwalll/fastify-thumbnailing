const User = require("../models/user");
const crypto  = require("crypto");
const bcrypt = require("bcryptjs");
const { error } = require("console");


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

        const user = await User.findOne({email})


    } catch (err) {
        reply.send(err)
    }
}
const User = require("../models/user");
const crypto  = require("crypto");
const bcrypt = require("bcryptjs");
const { error } = require("console");

exports.register = async (request, reply) => {

    try {

        const {name, email, password, country} = request.body

        if(!name || !email || !password ){
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

        if( !email || !password){
            reply.send("some field is missing bruh!")
        }

        const user = await User.findOne({email});

        if(!user){
            return reply.code(400).send({message: "Invalid email or password!"})
        }

        //validate the password

        const isValid = await bcrypt.compare(password, user.password)

        if(!isValid){
            return reply.code(400).send({message: "Invalid email or password"})
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

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordExpire = Date.now() + 10 * 60 * 1000;  //10 mins

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetPasswordExpire

        await user.save({validateBeforeSave: false});

        const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${resetToken}`

        reply.send({resetUrl})


    } catch (err) {
        reply.send(err)
    }
}

exports.resetPassword = async (request, reply) => {

    try {
        
        const resetToken = request.params.token
        const {newPassword} = request.body

        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpiry: {$gt: Date.now()}
        })

        if(!user){
            return reply.badRequest("Invalid or expired password reset token!")
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiry = undefined

        await user.save()

        reply.send({message: "password reset successful!"})


    } catch (err) {
        reply.send(err)
    }
}

exports.logout = async(request, reply) =>{
    // jwt are stateless, use strategy like refresh token or blacklist token for more

    reply.send({message : "user logged out!"})
}
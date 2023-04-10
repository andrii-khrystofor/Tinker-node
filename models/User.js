const mongoose = require('mongoose')

const Joi = require("joi"); // Or any schema validator (must have a .validate() method)
const Schema = mongoose.Schema


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
})

const loginShema = Joi.object().keys({
    email: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().required(),
  });
const signupSchema =  Joi.object().keys({
    email: Joi.string().alphanum().min(3).max(30).required().email(),
    password: Joi.string().required(),
    name: Joi.string().alphanum().min(3).max(30).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
  });
  
module.exports = mongoose.model('users', userSchema)
module.exports.loginShema = loginShema;
module.exports.signupSchema = signupSchema;
module.exports.user = userSchema;
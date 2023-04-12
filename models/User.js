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
    email: Joi.string().min(3).max(30).required().pattern(new RegExp('^.+@knu\.ua$')),
    password: Joi.string().required(),
  });
const signupSchema =  Joi.object().keys({
    email: Joi.string().min(3).max(30).required().pattern(new RegExp('^.+@knu\.ua$')),
    password: Joi.string().required(),
    name: Joi.string().min(3).max(30).required(),
    username: Joi.string().min(3).max(30).required().pattern(new RegExp('^@.*')),
  });
  
module.exports = mongoose.model('users', userSchema)
module.exports.loginShema = loginShema;
module.exports.signupSchema = signupSchema;
module.exports.user = userSchema;

class User  {
    email;
    password;
    name;
    username;
}

const OclEngine = require("@stekoe/ocl.js").OclEngine;

// Define OCL rule
const myOclExpression = `
    -- User email should be unique
    context User
        inv: self.email->isUnique(self.email)

    -- Username should starts with @
    context User
        inv: self.username.substring(0,1)="@"

    -- Email should be a knu.ua
    context User
        inv: self.username.indexof("knu.ua") > 0
    

`;

// Instantiate the OclEngine here
const oclEngine = OclEngine.create();

// Add your first OCL expression here
oclEngine.addOclExpression(myOclExpression);

// Evaluate an object obj against all know OCL expressions
const oclResult = oclEngine.evaluate(new User());
console.log('user', oclResult);
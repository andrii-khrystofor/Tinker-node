const mongoose = require('mongoose')
const Schema = mongoose.Schema

const contactSchema = new Schema({
    firstUser: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    secondUser: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
})

class Contact{
    firstUser;
    secondUser;
}

const OclEngine = require("@stekoe/ocl.js").OclEngine;

// Define OCL rule
const myOclExpression = `
    -- If there is first user, second should be there too
    context Contact
        inv: self.firstUser->isEmpty() = false
        inv: self.secondUser->isEmpty() = false
`;

// Instantiate the OclEngine here
const oclEngine = OclEngine.create();

// Add your first OCL expression here
oclEngine.addOclExpression(myOclExpression);

// Evaluate an object obj against all know OCL expressions
const oclResult = oclEngine.evaluate(new Contact);
console.log(oclResult);

module.exports = mongoose.model('contacts', contactSchema)
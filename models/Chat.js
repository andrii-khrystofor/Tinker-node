const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    isGroupChat: {
        type: Boolean,
        required: true
    },
    description: {
        type: String
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'messages',
        required: true
    }],
})

module.exports = mongoose.model('chats', chatSchema)
class Chat{
    name;
    isGroupChat;
    description;
    messages;
    users;
}

const OclEngine = require("@stekoe/ocl.js").OclEngine;

// Define OCL rule
const myOclExpression = `
    -- If chat is not groupChat , there shouldn't be more than 2 users
    context Chat
        inv: self.isGroupChat = false
        inv: self.users->size() = 2
`;

// Instantiate the OclEngine here
const oclEngine = OclEngine.create();

// Add your first OCL expression here
oclEngine.addOclExpression(myOclExpression);

// Evaluate an object obj against all know OCL expressions
const oclResult = oclEngine.evaluate(new Chat);
console.log(oclResult);
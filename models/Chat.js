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
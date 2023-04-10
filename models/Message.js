const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
    text: {
        type: String,
        require: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    chatId: {
        type: Schema.Types.ObjectId,
        ref: 'chats',
        required: true
    },
    sentTime: {
        type: Date,
        default: Date.now
    },
    isPinned: {
        type: Boolean
    }
})

module.exports = mongoose.model('messages', messageSchema)
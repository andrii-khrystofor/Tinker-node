const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userToChatSchema = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: 'chats',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    isPinned: {
        type: Boolean
    }
})

module.exports = mongoose.model('userToChats', userToChatSchema)
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

module.exports = mongoose.model('contacts', contactSchema)
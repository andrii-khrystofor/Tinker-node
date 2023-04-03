const User = require('../models/User')
const Contact = require('../models/Contact')
const keys = require('../config/keys')


module.exports.addContact = async function (firstUser, secondUser) {
    const firstUserId = firstUser;
    const secondUserId = await User.findOne({ username: secondUser })

    const contactFirstToSecond = new Contact({
        firstUser: firstUserId, secondUser: secondUserId
    })

    const contactSecondToFirst = new Contact({
        secondUser: firstUserId, firstUser: secondUserId
    })

    try {
        await contactFirstToSecond.save()
        await contactSecondToFirst.save()
    } catch (e) {
        console.log(e)
        // errorHandler(res, e)
    }
}

module.exports.getContacts = async function (user) {
    const contacts = await Contact.find({ firstUser: user })

    const fullContacts = await Promise.all(contacts.map(async (contact) => await User.findById(contact.secondUser.toString())));

    return fullContacts
}
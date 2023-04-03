const Chat = require('../models/Chat')

module.exports.createChat = async function (data) {
    const chat = new Chat({
        name: data.name,
        isGroupChat: data.isGroupChat,
        description: data.description
    })

    try {
        await chat.save()
        return chat
    } catch (e) {
        console.log(e)
    }
}

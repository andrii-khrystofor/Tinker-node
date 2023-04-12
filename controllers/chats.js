const Chat = require('../models/Chat')
const User = require('../models/User')

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

module.exports.getChatInfo = async function (data) {
    const chat = await Chat.findById(data.chatId)
    if (chat){
        if (chat.isGroupChat) return chat

        const userIds = chat.name.split(':')
        const secondUserId = userIds[0] === data.userId ? userIds[1] : userIds[0]
        const secondUser = await User.findById(secondUserId)
        console.log(secondUser)
        chat.name = secondUser.name
        return chat
    } else {
        return 
    }
}
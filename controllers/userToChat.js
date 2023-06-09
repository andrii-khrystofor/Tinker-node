const UserToChat = require('../models/UserToChat')
const User = require('../models/User')
const Chat = require('../models/Chat')

module.exports.addUserToChat = async function (userId, chatId, isPinned) {
    const userToChat = new UserToChat({
        userId,
        chatId,
        isPinned: isPinned ? isPinned : false
    })

    try {
        await userToChat.save()
        return userToChat
    }
    catch (e) {
        console.log(e)
    }
}

module.exports.getUserToChat = async function (userId, chatId) {
    const userToChat = await UserToChat.findOne({ userId, chatId })
    return userToChat
}

module.exports.listChatsByUser = async function (userId) {
    const userToChats = await UserToChat.find({ userId })

    const fullChats = await Promise.all(userToChats.map(async (el) => {
        const chat = await Chat.findById(el.chatId);
        return {...chat._doc, isPinned: el.isPinned}
   
    }))

    return fullChats

}
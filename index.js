const app = require('./app')
const http = require('http').createServer(app)
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
})
const port = process.env.PORT || 3000


const contacts = require('./controllers/contacts')
const chats = require('./controllers/chats')
const userToChats = require('./controllers/userToChat')
const keys = require('./config/keys')
const jwt = require('jsonwebtoken')

const User = require('./models/User')
const Chat = require('./models/Chat')
const Message = require('./models/Message')

http.listen(port, () => {
    console.log(`Server has been started on ${port}`);
    socketIO.on('connection', (socket) => {
        const connectionId = socket.client.sockets.entries().next().value[0]

        console.log(`New connection`, connectionId);

        socket.join(connectionId)

        socket.on('updateUser', async (data) => {
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: data.id },
                    { $set: data.updatedUser }
                )

                const accessToken = jwt.sign({
                    email: updatedUser.email,
                    id: updatedUser._id,
                    name: updatedUser.name,
                    username: updatedUser.username
                }, keys.jwt, { expiresIn: 3600 })

                socketIO.sockets.to(connectionId).emit('updateUser', accessToken);
            }
            catch (e) {
                console.log(e)
            }
        })

        socket.on('addContact', async (data) => {
            contacts.addContact(data.firstUser, data.secondUser).then(
                async () => {
                    const contactsList = await contacts.getContacts(data.firstUser);
                    socketIO.sockets.to(connectionId).emit('getContacts', contactsList);
                })
        });

        socket.on('getContacts', async (data) => {
            const contactsList = await contacts.getContacts(data.user);
            socketIO.sockets.to(connectionId).emit('getContacts', contactsList)
        })

        socket.on('createDialog', async (data) => {
            const firstUser = data.firstUser
            const secondUser = data.secondUser

            const chatCandidate = await Chat.findOne({ name: `${firstUser.id}:${secondUser._id}` })

            console.log('CHAT CANDIDATE', chatCandidate)

            if (!chatCandidate) {
                const chat = await chats.createChat({
                    name: `${firstUser.id}:${secondUser._id}`,
                    isGroupChat: false
                })

                await userToChats.addUserToChat(secondUser._id, chat._id)

                socketIO.sockets.to(connectionId).emit('createDialog', await userToChats.addUserToChat(firstUser.id, chat._id))
            }
            else {
                socketIO.sockets.to(connectionId).emit('createDialog', await userToChats.getUserToChat(firstUser.id, chatCandidate._id))
            }
        })

        socket.on('listChatsByUser', async (data) => {
            const chats = await userToChats.listChatsByUser(data.userId)

            const fullChats = await Promise.all(chats.map(async (chat) => {
                if (!chat.isGroupChat) {
                    const userIds = chat.name.split(':')
                    const secondUserId = userIds[0] === data.userId ? userIds[1] : userIds[0]
                    const secondUser = await User.findById(secondUserId)
                    console.log(secondUser)
                    chat.name = secondUser.name
                    return chat
                }
            }))
            socketIO.sockets.to(connectionId).emit('listChatsByUser', fullChats)
        })

        socket.on('getChatInfo', async (data) => {
            socket.join(data.chatId)
            socketIO.sockets.to(connectionId).emit('getChatInfo', await chats.getChatInfo(data))
        })

        socket.on('sendMessage', async (data) => {
            const messageToSave = new Message({
                text: data.message,
                senderId: data.senderId,
                chatId: data.chatId,
                isPinned: false
            })

            console.log(messageToSave)
            try {
                const savedMessage = await messageToSave.save()
                const chat = await Chat.findById(data.chatId)
                chat.messages.push(savedMessage)
                await chat.save()
                socketIO.sockets
                    .to(data.chatId)
                    .emit('getMessage', savedMessage)
            }
            catch (e) {
                console.log(e)
            }
        })

        socket.on('getMessagesByChat', async (data) => {
            const chat = await Chat.findById(data.chatId)
            const messages = await Promise.all(
                chat.messages.map(
                    async message => await Message.findById(message.toString())
                )
            )

            socketIO.sockets
                .to(data.chatId)
                .emit('getMessagesByChat', messages.sort((a, b) => {
                    if (a && b)
                        return (a.sentTime > b.sentTime ? 1 : 0);
                }))
        })
    })
})

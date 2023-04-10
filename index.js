const app = require('./app')
const http = require('http').createServer(app)
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
})

const contract = require("express-contract").contract;
const port = process.env.PORT || 3000


const contacts = require('./controllers/contacts')
const chats = require('./controllers/chats')
const userToChats = require('./controllers/userToChat')
const keys = require('./config/keys')
const jwt = require('jsonwebtoken')

const User = require('./models/User')
const updateUserSchema = require('./models/User').updateUserSchema
const Chat = require('./models/Chat')
const Message = require('./models/Message')

http.listen(port, () => {
    console.log(`Server has been started on ${port}`);
    socketIO.on('connection', (socket) => {
        console.log(socket.handshake.query.userId);

        const userId = socket.handshake.query.userId;

        const listChatsByuser = async (data) => {
            const chats = await userToChats.listChatsByUser(data.userId)
        
            console.log(chats);
            const fullChats = await Promise.all(chats.map(async (chat) => {
                if (!chat.isGroupChat) {
                    const userIds = chat.name.split(':')
                    const secondUserId = userIds[0] === data.userId ? userIds[1] : userIds[0]
                    const secondUser = await User.findById(secondUserId)
                    chat.name = secondUser.name
                    return chat
                } else {
                    return chat;
                } 
            }))
            socketIO.sockets.to(data.userId).emit('listChatsByUser', fullChats)
        }

        console.log(`New connection`, userId);

        socket.join(userId)

        socket.on('updateUser', async (data) => {
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: userId },
                    { $set: data.updatedUser },
                    {new: true}
                )

                const accessToken = jwt.sign({
                    email: updatedUser.email,
                    id: updatedUser._id,
                    name: updatedUser.name,
                    username: updatedUser.username
                }, keys.jwt, { expiresIn: 3600 })

                socketIO.sockets.to(userId).emit('updateUser', accessToken);
            }
            catch (e) {
                console.log(e)
            }
        })

        socket.on('addContact', async (data) => {
            contacts.addContact(data.firstUser, data.secondUser).then(
                async () => {
                    const contactsList = await contacts.getContacts(data.firstUser);
                    socketIO.sockets.to(userId).emit('getContacts', contactsList);
                })
        });

        socket.on('getContacts', async (data) => {
            const contactsList = await contacts.getContacts(userId);
            socketIO.sockets.to(userId).emit('getContacts', contactsList)
        })

        socket.on('createDialog', async (data) => {
            const firstUser = data.firstUser
            const secondUser = data.secondUser

            const chatCandidate = await Chat.findOne({ name: `${firstUser.id}:${secondUser._id}` })


            if (!chatCandidate) {
                const chat = await chats.createChat({
                    name: `${firstUser.id}:${secondUser._id}`,
                    isGroupChat: false
                })

                await userToChats.addUserToChat(secondUser._id, chat._id)

                socketIO.sockets.to(userId).emit('createDialog', await userToChats.addUserToChat(firstUser.id, chat._id))

            }
            else {
                socketIO.sockets.to(userId).emit('createDialog', await userToChats.getUserToChat(firstUser.id, chatCandidate._id))
            }
            listChatsByuser({userId: firstUser.id});
            listChatsByuser({userId: secondUser.id});

        })


        socket.on('createGroupChat', async (data) => {
            const users = data.users;
            console.log(users);
            const name = data.name;

            const chat = await chats.createChat({
                name: name,
                isGroupChat: true
            })

            await users.forEach(async (user) => {
                await userToChats.addUserToChat(user, chat._id);
            });

            users.forEach(user => {
                listChatsByuser({userId: user});
            })
            socketIO.sockets.to(userId).emit('createGroupChat', {chatId: chat._id});
        })

        socket.on('listChatsByUser', () => listChatsByuser(userId))

        socket.on('getChatInfo', async (data) => {
            socket.join(data.chatId)
            socketIO.sockets.to(userId).emit('getChatInfo', await chats.getChatInfo(data))
        })

        socket.on('sendMessage', async (data) => {
            const messageToSave = new Message({
                text: data.message,
                senderId: data.senderId,
                chatId: data.chatId,
                isPinned: false
            })

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


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

http.listen(port, () => {
    console.log(`Server has been started on ${port}`);
    socketIO.on('connection', (socket) => {
        console.log(`New connection ${socket}`);

        socket.on('updateUser', async (data) => {
            console.log(data)

            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: data.id },
                    { $set: data.user }
                )

                const accessToken = jwt.sign({
                    email: updatedUser.email,
                    id: updatedUser._id,
                    name: updatedUser.name,
                    username: updatedUser.username
                }, keys.jwt, { expiresIn: 3600 })

                socketIO.sockets.emit('updateUser', accessToken);
            }
            catch (e) {
                console.log(e)
            }
        })

        socket.on('addContact', async (data) => {
            contacts.addContact(data.firstUser, data.secondUser).then(
                async () => {
                    const contactsList = await contacts.getContacts(data.firstUser);
                    console.log(contactsList)
                    socketIO.sockets.emit('getContacts', contactsList);
                })

        });

        socket.on('getContacts', async (data) => {
            const contactsList = await contacts.getContacts(data.user);
            socketIO.sockets.emit('getContacts', contactsList)
        })

        socket.on('createDialog', async (data) => {
            const firstUser = data.firstUser
            const secondUser = data.secondUser
            console.log('firstUser', firstUser)
            console.log('secondUser', secondUser)

            const chatFirstToSecond = await chats.createChat({
                name: secondUser.name,
                isGroupChat: false
            })
            const chatSecondToFirst = await chats.createChat({
                name: firstUser.name,
                isGroupChat: false
            })
            console.log(await userToChats.addUserToChat(secondUser._id, chatSecondToFirst._id))

            socketIO.sockets.emit('createDialog', await userToChats.addUserToChat(firstUser.id, chatFirstToSecond._id))
        })

        socket.on('listChatsByUser', async (data) => {
            const chats = await userToChats.listChatsByUser(data.userId)
            socketIO.sockets.emit('listChatsByUser', chats)
        })
    })
})

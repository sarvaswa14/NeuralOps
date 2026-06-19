const { Server } = require('socket.io')
let io
const initSocket = (server) => {
    io = new Server(server, {
        cors:{
            origin: ['https://neural-ops-gilt.vercel.app', 'http://localhost:5173'],
            methods: ['GET', 'POST']
        }
    })
    return io
}
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized')
    }
    return io
}
module.exports ={
    initSocket,
    getIO
}
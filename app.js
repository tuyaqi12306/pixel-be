const path = require('path')
const express = require('express')
const SocketIO = require('socket.io')

const app = express()
const port = 3005
const server = app.listen(port, () => {
  console.log('listenning on port', port)
})
const io = SocketIO(server)
// app.use(express.static(''))
const pixelData = [
  ['red','blue','green','black'],
  ['red','blue','green','black'],
  ['red','blue','green','black'],
  ['red','blue','green','black']
]
let clients = []
io.on('connection', (socket) => { // 服务器连接
  clients.push(socket)
  socket.emit('init-pixel-data', pixelData)

  socket.on('draw-dot', ({row,col,color}) => { // 点击画板改颜色
    pixelData[row][col] = color
    socket.broadcast.emit('updata-dot', {row,col,color}) // 广播给其他每一个连接的客户端
    socket.emit('updata-dot', {row,col,color}) // 给自己发一份
  })
  socket.on('disconnect', () => { // 关闭连接
    clients = clients.filter(it => it !== socket)
    console.log('someone leaves')
  })
})

// 启动：node app.js

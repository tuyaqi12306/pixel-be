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
io.on('connection', (ws) => { // 服务器连接
  ws.emit('pixel-data', pixelData)
  ws.on('disconnect', () => { // 关闭连接
    console.log('someone leaves')
  })
})

// 启动：node app.js

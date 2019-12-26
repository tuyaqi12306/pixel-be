const path = require('path')
const express = require('express')
const SocketIO = require('socket.io')
const Jimp = require('jimp')
const fs = require('fs')

const app = express()
const port = 3005
const server = app.listen(port, () => {
  console.log('listenning on port', port)
})
const io = SocketIO(server)
// app.use(express.static(path.join(__dirname,'../fe/build'))) // 静态文件运行

async function main() {
  const pixelData = await Jimp.read('./pixelData.png') // 255*255的图片
  // const pixelData = new Jimp(20, 20, 0xffff00ff)
  let onlinePeople = 0
  let dotOperations = [] // 画了多少点
  setInterval(() => {
    if(dotOperations) {
      io.emit('update-dots', dotOperations)
      dotOperations = []
    }
  }, 100) // 100ms服务器向客户端发送一次数据

  io.on('connection', async (socket) => { // 服务器连接
    onlinePeople++
    let pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG) // 根据文档api,Jimp拿到PNG压缩的真实数据
    socket.emit('init-pixel-data', pngBuffer)

    let lastDrawTime = 0
    socket.on('draw-dot', async ({row,col,color}) => { // 点击画板改颜色
      let now = Date.now()
      if(now - lastDrawTime < 500) { // 限制点击频率
        return
      }
      lastDrawTime = now
      let hexColor = Jimp.cssColorToHex(color) // 将传入的css样式的color转为16进制
      pixelData.setPixelColor(hexColor, col, row) // 将点击的颜色设置上去
      dotOperations.push({row, col, color})

      // io.emit('update-dot', {row,col,color}) // 给所有客户端发一份
      io.emit('online-count', onlinePeople) // 服务器给所有客户端发送
      // socket.broadcast.emit('updata-dot', {row,col,color}) // 广播给其他每一个连接的客户端
      // socket.emit('updata-dot', {row,col,color}) // 给自己发一份
      // socket.broadcast.emit('online-count', onlinePeople)
      // socket.emit('online-count', onlinePeople)

      try {
        let buf = await pixelData.getBufferAsync(Jimp.MIME_PNG)
        await fs.writeFile('./pixelData.png', buf) // 将拿到的数据保存成一个文件
        console.log('save pixel success!')
      }catch(e) {
        console.log(e)
      }
    })

    socket.on('chat-msg', msg => {
      io.emit('chat-msg', msg)
    })

    socket.on('disconnect', () => { // 关闭连接
      onlinePeople--
      console.log('someone leaves')
    })
  })
}
main()
// 启动：node app.js

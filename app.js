var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var fs = require('fs')

server.listen(8000);

var userAll = []

app.use(require('express').static('./public/'))

app.get('/', function (req, res) {
  fs.readFile(__dirname + '/index.html', 'utf-8', (err, data) => {
    if(err) {
      console.log(err)
      return
    }
    res.end(data)
  })
  // res.sendfile(__dirname + '/index.html')
})

//其他路由
app.get('/data', (req, res) => {
  console.log(req.query)
  res.end(JSON.stringify(req.query))
}) 

io.on('connection', function (socket) {
  // 监听客户端登录请求
  socket.on('login', function(data) {
    socket.username = data.username
    socket.roomname = data.roomname
    socket.avatar = data.avatar
    var isLogin = userAll.find(item => {
      return item.username === data.username
    })

    // 抛出失败消息
    if(isLogin) {
      socket.emit('loginErr', {msg: '登录失败'})
      return
    }

    // 将用户加入用户列表中
    userAll.push(data)
    socket.join(socket.roomname)
    socket.emit('loginSuccess', data)

    // 将用户列表发送到客户端
    io.to(socket.roomname).emit('userAll', filterUserList(userAll, socket.roomname))

    // 监听用户加入
    io.to(socket.roomname).emit('addUser', data)

    // 用户聊天消息
    socket.on('chatMsg', data => {
      // 将接收到的聊天记录以及用户信息广播出去
      io.to(socket.roomname).emit('backChatMsg', data)
    })

    // 监听用户发来的图片消息
    socket.on('sendImgMsg', data => {

      // 将接受到的图片消息广播出去
      io.to(socket.roomname).emit('backImgMsg', data)
    })

    // 监听客户端离开的事件
    socket.on('disconnect', () => {
      var index = userAll.findIndex(item => item.username === socket.username)
      userAll.splice(index, 1)
      io.to(socket.roomname).emit('userAll', filterUserList(userAll, socket.roomname))
      io.to(socket.roomname).emit('leaveroom', {username: socket.username, avatar: socket.avatar})
    })
  })


  function filterUserList(userlist, room) {
    return userlist.filter(item => item.roomname === room)
  }
}) 

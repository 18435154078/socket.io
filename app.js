const http = require('http')
const fs = require('fs')
const socket = require('socket.io')

const server = http.createServer(function(req, res) {
    fs.readFile(__dirname + '/index.html', function(err, data) {
        if(err) {
            res.writeHead(500)
            return res.end('Error')
        } else {
            res.end(data)
        }
    })
}).listen(8000)

const io = socket(server)

io.on('connection', socket => {
    // console.log('已连接')
    socket.emit('news', { world: 'world' });
    socket.on('哈哈', function (data) {
        console.log(data);
    });
})

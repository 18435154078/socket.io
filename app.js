const http = require('http')
const fs = require('fs')

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

const io = require('socket.io')(server)

io.on('connection', socket => {
    console.log('已连接')
})

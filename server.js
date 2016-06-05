var express = require('express')
var http = require('http')
var socketio = require('socket.io')
var faker = require('faker')
var snake = require('./snake')

var server = http.createServer();         // low level server that will listen on the network

var app = express();                      // create a web server
server.on('request', app);                // express app handles HTTP requests (GET/POST)

var ioServer = socketio();                // creates a socket.io server
ioServer.attach(server);                  // socket.io server handles WS requests

app.use(express.static('public'))

var snakeServer = snake.server()

ioServer.on('connection', function(socket) {
  var from = faker.name.firstName()

  console.log(from, 'connected')
  snakeServer.addPlayer(from)

  socket.on('dir', function(dir){
    console.log('dir: ' + dir)
    snakeServer.setDir(from, dir)
  })

  socket.on('disconnect', function(){
    console.log(from, 'disconnected')
    snakeServer.removePlayer(from)
  })

})

var mainLoop = function(){
  ioServer.emit('state', snake.state)
  snake.update()
  mainLoopTimer = setTimeout(mainLoop, 80); // again!
}
var mainLoopTimer = setTimeout(mainLoop, 80)

server.listen(3000, function(){
  console.log('listening on *:3000')
})

var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose'); 
var app = express();
console.log('server startup'); 
//var http = require('http').Server(app);
// var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   res.send("ITS WORKING");
//   //res.sendFile(__dirname + '/index.html');
// });

// io.on('connection', function(socket){
//   console.log('a user connected');
// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     console.log('message: ' + msg);
//   });
// });


// Enable CORS
app.use(cors());

// Socket connection
// Creates new socket server for socket */
var socketServer = require('http').createServer(app);
var io = require('socket.io')(socketServer);
// Listen for socket connection on port 3002 */
socketServer.listen(3002, function(){
  console.log('Socket server listening on *:3002');
});
// This event will emit when client connects to the socket server
io.on('connection', function(socket){
  console.log('Socket connection established');
});
// Create HTTP server for node application */
var server = require('http').Server(app);
// Node application will be running on 3000 port */
server.listen(3000, function(){
  console.log('HTTP server listening on *:3000');
});

app.get('/img1.png', function(req, res){
  //res.send('<h1>NODE SERVER</h1>');
  res.sendFile(__dirname + '/img1.png')
});
app.get('/', function(req, res){
  //res.send('<h1>NODE SERVER</h1>');
  res.sendFile(__dirname + '/index.html')
});
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});
    
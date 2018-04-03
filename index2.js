var express = require('express');
var cors = require('cors');
var app = express();
const socketPort = 3002
const serverPort = 3000
// Enable CORS
app.use(cors());

function updateUser(id, type, website) {
	if (type){
		sites[website].push(id);
	}
}

function getHelper(website) {
	return sites[website].pop();
}

// Socket connection
// Creates new socket server for socket
var socketServer = require('http').createServer(app);
var io = require('socket.io')(socketServer);

// Listen for socket connection on port 3002
socketServer.listen(socketPort, function(){
	console.log('Socket server listening on *:3002');
});

io.on('connection', function(socket){
	console.log('Socket connection established');
	// Join personalized chat room
	socket.on('join', function(data){
		socket.join(data.id);
		updateUser(data.id, data.type, data.website);
	});
	// Send init message
	socket.on('first message', function(data){
		if (!data.type) {//helper
			let helperID = getHelper(data.website);
			io.to(helperID).emit('message', {msg: data.msg, callbackID: data.id});
			io.to(data.id).emit('message', {msg: data.msg, callbackID: helperID})
		}
	});
	// Send message
	socket.on('message', function(data){
		io.to(data.callbackID).emit('message', {msg: data.msg, callbackID: data.callbackID})
	});

});

// Node application

// Create HTTP server for node application 
var server = require('http').Server(app);

// Node application will be running on 3000 port
server.listen(serverPort, function(){
	console.log('HTTP server listening on *:3000');
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html')
});

users = {}
sites = {website: []}
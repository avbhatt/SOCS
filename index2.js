var express = require('express');
var cors = require('cors');
const MongoClient = require('mongodb').MongoClient
var app = express();
const socketPort = 3002
const serverPort = 3000
// Enable CORS
app.use(cors());

var db;

MongoClient.connect('mongodb://server:wah123@ds127044.mlab.com:27044/wah_db', (err, client) => {
	if (err) { return console.log(err); }

	// store global db object
	db = client.db('wah_db'); 

	// active_entities schema: [{sock_id: string, entity_type: string, website: string, is_chatting: boolean}]
	db.createCollection('active_entities', {});
	// message_logs schema: [{from: id, to: id, message: string, time: date_string}]
	db.createCollection('message_logs', {});
	// annotations schema: [{website: string, category: string, text: string}]
	db.createCollection('annotations', {});
})

// called when a new entity activates the browser extension by clicking a toolbar option ('User', 'Helper')
function addEntity(id, type, website) {
	// add entity to mongo active_entities collection
	var new_entity = {
		sock_id: id,
		entity_type: type,
		website: website,
		is_chatting: false
	}

	db.collection('active_entities').save(new_entity, (err, result) => {
	    if (err) {
			return console.log(err);
	    }
	    console.log("successful addEntity call"); 
	});

	// if this a new helper, check for waiting users who need help

	// if (!type){
	// 	sites[website].push(id);
	// }
}

// called when an entity either changes their role, or changes website
function updateEntity(id, type, website) {
	// change an entity in the mongo collection--either website or type could change
	db.collection('active_entities').updateOne({ sock_id: id }, { $set: {type: type, website: website}});

	// check for waiting user--open a new connection if one exists on this same webpage
}

// called on extension close
function removeEntity(id) {
	db.collection('active_entities').deleteOne({ sock_id: id });	
}

// called when a user attempts to open a chat 
function getHelper(website) {

	// TODO (REACH): find way to check to make sure this helper hasn't already failed to help a user with a given problem
	// i.e. don't return same helper to user chat 

	// find an idle helper 
	var idle_helper = db.collection('active_entities').find({
		website: website, is_chatting: false
	});

	console.log(idle_helper);

	var helper_id = idle_helper["id"];

	// update the idle helper to be busy
	db.collection('active_entities').updateOne({ id: helper_id }, { $set: {is_chatting: true}});

	return helper_id;
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
		addEntity(data.id, data.type, data.website);
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
		//add to mongo
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

var express = require('express');
var cors = require('cors');
const MongoClient = require('mongodb').MongoClient
var app = express();
const socketPort = 3002
const serverPort = 3000
// Enable CORS
app.use(cors());

var db;

// server initializes connection to mongoDB
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

	// TODO: check for waiting users on the same webpage 
}

// called when an entity changes entity_type
function updateEntityType(sock_id, type) {
	// change an entity in the mongo collection--either website or type could change
	db.collection('active_entities').updateOne({ sock_id: sock_id }, { $set: {entity_type: type}});

	// TODO: check for waiting users on same webpage
}

// called when an entity changes website
function updateEntityWebsite(sock_id, website) {
	// change an entity in the mongo collection--either website or type could change
	db.collection('active_entities').updateOne({ sock_id: sock_id }, { $set: {website: website}});

	// TODO: check for waiting users on same webpage
}

// called on extension close
function removeEntity(sock_id) {
	db.collection('active_entities').deleteOne({ sock_id: sock_id });	
}

// called when a user attempts to open a chat 
async function getHelper(website) {

	// TODO (REACH): find way to check to make sure this helper hasn't already failed to help a user with a given problem
	// i.e. don't return same helper to user chat 

	// find an idle helper 
	let helper_find_promise = db.collection('active_entities').findOne({ website: website, is_chatting: false, entity_type: "Helper"});
	let helper_data = await helper_find_promise;

	// there are no idle helpers 
	if (helper_data === null) {
		// TODO: how do we want to handle this case?
		return null; 
	}

	var helper_id = helper_data["sock_id"];

	// update the idle helper to be in a chat currently
	db.collection('active_entities').updateOne({ sock_id: helper_id }, { $set: {is_chatting: true}} );

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
		console.log(data.website)
		console.log(data.id);
		socket.join(data.id);
		addEntity(data.id, data.type, data.website);
	});
	// Send init message
	// NOTE: do we want to adapt this message for above functions that 
	// try to detect if a user is waiting for a helper? 
	socket.on('first message', function(data){
		if (data.type == "Helper") {//helper
			let helperID = getHelper(data.website);
			io.to(helperID).emit('message', {msg: data.msg, callbackID: data.id});
			io.to(data.id).emit('message', {msg: data.msg, callbackID: helperID});
		}
	});
	// Send message
	socket.on('message', async function(data) {
		console.log(data.msg)
		if (!data.callbackID){
			var helper_sock_id = await getHelper(data.website);
			io.to(helper_sock_id).emit('message', {msg: data.msg, callbackID: data.id})
			// helper.then((fulfilled, rejected) => {
			// 	console.log(fulfilled);
			// 	console.log(rejected);
			// 	let helperID = fulfilled.id;
			// 	io.to(helperID).emit('message', {msg: data.msg, callbackID: data.id});
			// })
		}
		else {
			io.to(data.callbackID).emit('message', {msg: data.msg, callbackID: data.id});
		}
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

// TODO: API endpoint to return an object of form [{category: string, texts: [string]}]

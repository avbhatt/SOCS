var express = require('express');
var cors = require('cors');
const MongoClient = require('mongodb').MongoClient
const socketPort = 3002
const serverPort = 3000
var app = express();
app.use(cors()); // Enable CORS

var db;
var socketServer;
var io;
var http_server;

// server code initializes by making connection to mongo 
// and initializing socket and server info after connection
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
	console.log("successful connection to Mongo DB");

	init_socket_server();
	console.log("successful Socket.IO init");

	init_http_server(); 
	console.log("successful http server init"); 
})

///////////////////////////////////////////////////////////////////////////////
////////////////////// Socket.IO functionality  //////////////////////////////
//////////////////////////////////////////////////////////////////////////////

// Socket connection
// Creates new socket server for socket
function init_socket_server() {
	socketServer = require('http').createServer(app);
	io = require('socket.io')(socketServer);

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

			// stores in active_entities mongo collection
			new_entity_dict = {
				sock_id: data.id,
				entity_type: data.type,
				website: data.website,
				is_chatting: false,
				is_waiting: false
			}
			storeData("active_entities", new_entity_dict);

			// TODO: check for waiting users on the same webpage if helper is joining

		});
		// Send init message
		socket.on('first message', async function(data){
			if (data.type == "Helper") {//helper
				console.log(data.website);
				var helper_id = await getHelper(data.id, "https://www.yahoo.com/");
				console.log(helper_id); 
				io.to(helperID).emit('message', {msg: data.msg, callbackID: data.id});
				io.to(data.id).emit('message', {msg: data.msg, callbackID: helperID});
			}
		});
		// Send message
		socket.on('message', async function(data) {
			console.log(data.msg)
			if (!data.callbackID){
				console.log("First Message");
				console.log(data.website);
				var helper_id = await getHelper(data.id, "https://www.yahoo.com/")
				console.log(helper_id);
				io.to(helper_id).emit('message', {msg: data.msg, callbackID: data.id})					
			}
			else {
				io.to(data.callbackID).emit('message', {msg: data.msg, callbackID: data.id});
			}
		});
	});
}

///////////////////////////////////////////////////////////////////////////////
////////////////////// server / routing functions /////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Node application

// Create HTTP server for node application 
function init_http_server() {
	http_server = require('http').Server(app);

	// Node application will be running on 3000 port
	http_server.listen(serverPort, function(){
		console.log('HTTP server listening on *:3000');
	});

	app.get('/', function(req, res){
		res.sendFile(__dirname + '/index.html')
	});

}

// TODO: API endpoint to return an object of form [{category: string, texts: [string]}]

///////////////////////////////////////////////////////////////////////////////
//////////////////////// mongo query functions ////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// called when a new entity activates the browser extension by clicking a toolbar option ('User', 'Helper')

function storeData(collection_name, document_dict) {
	db.collection(collection_name).save(document_dict, (err, result) => {
			if (err) { return console.log(err);}
			console.log("successful storeData call on collection: " + collection_name); 
	});
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

// called on extension close or user sign out ? 
function removeEntity(sock_id) {
	db.collection('active_entities').deleteOne({ sock_id: sock_id });	
}


// to be used whenever a helper becomes available on a webpage 
// NOTE: must be called within async function and given await keyword
async function getWaitingUser(website) {
	var waiting_user_find_promise = db.collection('active_entities').findOne({ website: website, is_waiting: true});
	var user_data = await waiting_user_find_promise;

	if (user_data === null) {
		console.log("no waiting users on website: " + website);
		return null; 
	}

	var user_sock_id = user_data["sock_id"];
	db.collection('active_entities').updateOne({ sock_id: user_sock_id }, { $set: {is_waiting: false}} );

	return user_sock_id;
}

// called when a user attempts to open a chat
// will either return idle helper sock_id or save the user as waiting in the db (returning null)
// NOTE: must be called within async function and given await keyword
async function getHelper(user_sock_id, website) {

	// TODO (REACH): find way to check to make sure this helper hasn't already failed to help a user with a given problem
	// i.e. don't return same helper to user chat 

	// find an idle helper 
	var helper_find_promise = db.collection('active_entities').findOne({ website: website, is_chatting: false, entity_type: "Helper"});
	var helper_data = await helper_find_promise;

	// there are no idle helpers 
	if (helper_data === null) {
		console.log("no idle helpers on same website");

		// fix for now - update the db to reflect that this user is waiting 
		// for a helper and couple with detectWaitingUser, which will 
		// execute every time a helper becomes available on a webpage
		db.collection('active_entities').updateOne({ sock_id: user_sock_id }, { $set: {is_waiting: true}});
		return null; 
	}

	var helper_id = helper_data["sock_id"];

	// update the idle helper to be in a chat currently
	db.collection('active_entities').updateOne({ sock_id: helper_id }, { $set: {is_chatting: true}} );

	return helper_id;
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////// helpers /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// YYYY:MM:DD:HH:MM:SS
function get_date() { return (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':');}
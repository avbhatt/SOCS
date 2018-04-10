///////////////////////////////////////////////////////////////////////////////
////////////////////// Socket.IO functionality  //////////////////////////////
//////////////////////////////////////////////////////////////////////////////
var express = require('express');
var bodyParser = require('body-parser'); 
var cors = require('cors');
var mongo = require('./mongo');

// global server/socket.io vars 
var socketServer;
var http_server;
var io;

// shared express app var
var app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// ports for testing 
const socketPort = 3002;
const serverPort = 3000;

module.exports = {
	// Socket connection
	// Creates new socket server
	init_socket_server: () => {
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
				console.log("JOIN START")
				if (data.id) {
					socket.join(data.id);
				}
		        new_entity_dict = { sock_id: data.id, entity_type: data.type, is_chatting: false, is_waiting: false };
				mongo.storeDataSimple("active_entities", new_entity_dict);
				console.log("JOIN END")

				// TODO: check for waiting users on the same webpage if helper is joining
					// if (data.type == "Helper") {
					//  var waiting_user_socket_id = await getWaitingUser(data.website);
					//  if (waiting_user_socket_id !== null) {
					//    // have the helper send an initialization message, as in below? 
					//  }
					// }
			});			

			// Send message
			socket.on('message', async function(data) {
				console.log("MESSAGE START")
				console.log(data.msg)
				if (!data.callbackID){
					console.log("First Message");
					console.log("passed in website is: " + data.website);
					var helper_id = await mongo.getHelper(data.id, data.website);
					console.log(helper_id);

			        // store msg in db
			        new_msg = { to: helper_id, from: data.id, message: data.msg, time: get_date() };
			        mongo.storeData("message_logs", new_msg);
					io.to(helper_id).emit('message', {msg: data.msg, callbackID: data.id, type: data.type});
					io.to(data.id).emit('message', {msg: data.msg, callbackID: helper_id, type: data.type});			
				}
				else {
			        // store msg in db 
			        new_msg = { to: data.callbackID, from: data.id, message: data.msg, time: get_date() };
			        mongo.storeData("message_logs", new_msg);
					io.to(data.callbackID).emit('message', {msg: data.msg, callbackID: data.id, type: data.type});
					io.to(data.id).emit('message', {msg: data.msg, callbackID: data.callbackID, type: data.type});
				}
				console.log("MESSAGE END")
			});

			// Remove Dead User
			socket.on('disconnecting', function(data) {
				console.log("DISCONNECT START");
				console.log(socket.id);
				socket.leave(socket.id);
				mongo.removeEntity(socket.id);
				console.log("DISCONNECT END");
			});

			socket.on('close', function(data) {
				console.log("LEAVE START");
				console.log(socket.id);
				mongo.updateEntityStatus(socket.id, false);
				console.log("LEAVE END");
			})
		});
	},

	// Create HTTP server for node application 
	init_http_server: () => {
		http_server = require('http').Server(app);

		// Node application will be running on 3000 port
		http_server.listen(serverPort, function(){
			console.log('HTTP server listening on *:3000');
		});

		app.get('/', function(req, res){
			res.sendFile(__dirname + '/index.html')
		});

		app.get('/getAnnotations', async function(req, res) {
		    console.log("received getEntityInfo request for website: ");
		    console.log(req.query.website);
		    var ann_obj = await mongo.getWebsiteAnnotations(req.query.website); 
		    res.send(ann_obj);
		    console.log("serviced getAnnotations request with response: ");
		    console.log(ann_obj);
		});

		app.post('/postAnnotation', function(req, res) {
		    console.log("received postAnnotation request with body: ");
		    console.log(req.body);
		    var ann_json = req.body;
		    var annotation_dict = {website: ann_json["website"], category: ann_json["category"], text: ann_json["text"], upvotes: 0, downvotes: 0};
		    mongo.storeData("annotations", annotation_dict);
		    console.log("serviced postAnnotation request");
		});

		app.get('/getEntityInfo', async function(req, res) {
			console.log("received getEntityInfo request with socket_id: ");
			console.log(req.query.socket_id);
			var entity_info = await mongo.getEntityInfo(req.query.socket_id); 
			console.log("serviced getEntityInfo request with response: ");
			console.log(entity_info);
			if (entity_info){
				res.send(entity_info);
			}
			else {
				res.send("Does Not Exist");
			}
		});

		app.post('/updateEntityType', function(req, res) {
		    console.log("received updateEntityType request with body: ");
		    console.log(req.body);
		    mongo.updateEntityType(req.body.socket_id, req.body.entity_type);
		    console.log("serviced updateEntityType request");
		});

		app.post('/updateEntityWebsite', function(req, res) {
			console.log("received updateEntityWebsite request with body: ");
			console.log(req.body);
			mongo.updateEntityWebsite(req.body.socket_id, req.body.website);
			console.log("serviced updateEntityWebsite request");
		});

	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////// helpers /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// YYYY:MM:DD:HH:MM:SS
function get_date() { return (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':');}
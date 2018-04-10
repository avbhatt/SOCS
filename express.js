///////////////////////////////////////////////////////////////////////////////
////////////////////// Express app functionality  /////////////////////////////
///////////////////////////////////////////////////////////////////////////////
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
		socketServer.listen(socketPort, function() {
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

				// check for waiting users on the same webpage if helper is joining
				if (data.type == "Helper") {
					waitingUserCheck(data.website, data.id); 
				}
			});			

			// Send message
			socket.on('message', async function(data) {
				console.log("MESSAGE START")
				console.log(data.msg)
				if (!data.callbackID) {
					console.log("First Message");
					console.log("passed in website is: " + data.website);
					let helper_id = await mongo.getHelper(data.id, data.website, data.msg);
					console.log(helper_id);

					// if helper_id is null, the user msg was saved in DB and marked as waiting
					if (helper_id !== null) {
				        send_msg(helper_id, data.id, data.msg, data.type);			
					}
				}
				else {
					send_msg(data.callbackID, data.id, data.msg, data.type); 
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
		    var annotation_dict = {website: ann_json["website"], category: ann_json["category"], text: ann_json["text"], ups: 0, downs: 0};
		    mongo.storeData("annotations", annotation_dict);
		    console.log("serviced postAnnotation request");
		});

		app.post('/updateAnnVote', function(req, res) {
		    console.log("received updateAnnVote request with body: ");
		    console.log(req.body);
		    var ann_update_obj = {_id: req.body._id};
		    mongo.changeAnnVote(_id, req.body.vote); 
		    console.log("serviced updateAnnVote request");
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

		app.post('/updateEntityType', async function(req, res) {
		    console.log("received updateEntityType request with body: ");
		    console.log(req.body);
		    mongo.updateEntityType(req.body.socket_id, req.body.entity_type);

		    if (req.body.entity_type === "Helper") {
		    	var entity_info = await mongo.getEntityInfo(req.body.socket_id);
		    	console.log(entity_info);  
		    	if (entity_info["is_chatting"] === false) {
			    	waitingUserCheck(entity_info["website"], req.body.socket_id);
		    	}
		    }
		    console.log("serviced updateEntityType request");
		});

		app.post('/updateEntityWebsite', async function(req, res) {
			console.log("received updateEntityWebsite request with body: ");
			console.log(req.body);
			console.log("the website in this updateEntityWebsite req is: ");
			console.log(req.body.website); 
			if (req.body.website.indexOf("localhost") !== -1) {
				console.log('API call');
				return;
			} 
			mongo.updateEntityWebsite(req.body.socket_id, req.body.website);
	    	var entity_info = await mongo.getEntityInfo(req.body.socket_id); 
	    	console.log(entity_info);
		    if (entity_info["entity_type"] === "Helper") {
		    	if (entity_info["is_chatting"] === false) {
			    	waitingUserCheck(req.body.website, req.body.socket_id);
		    	}
		    }
			console.log("serviced updateEntityWebsite request");
		});

		// TODO: handle end of conversation

	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////// helpers /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// YYYY:MM:DD:HH:MM:SS
function get_date() { return (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':');}

function send_msg(to, _from, msg, from_type) {
	var new_msg = { to: to, from: _from, message: msg, time: get_date() };
	mongo.storeData("message_logs", new_msg);
	io.to(to).emit('message', {msg: msg, callbackID: _from, type: from_type});
	io.to(_from).emit('message', {msg: msg, callbackID: to, type: from_type});			
}

// called everytime a helper becomes available
async function waitingUserCheck(website, helper_id) {
	console.log("entered waitingUserCheck with website: " + website + "and id: " + helper_id);
	var waiting_user_obj = await mongo.getWaitingUser(website, helper_id);
	console.log("returned waiting_user_obj is: ");
	console.log(waiting_user_obj); 
	if (waiting_user_obj !== null) {
		var waiting_user_id = waiting_user_obj["sock_id"];
		var waiting_user_msg = waiting_user_obj["waiting_msg"];
		send_msg(helper_id, waiting_user_id, waiting_user_msg, "User"); 
	}
}
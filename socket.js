///////////////////////////////////////////////////////////////////////////////
////////////////////// Socket.IO functionality  //////////////////////////////
//////////////////////////////////////////////////////////////////////////////
var express = require('express');
var bodyParser = require('body-parser'); 
var cors = require('cors');
var socketServer;
var io;
var app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); 
const socketPort = 3002;
var mongo = require('./mongo');

module.exports = {
	// Socket connection
	// Creates new socket server
	init_socket_server: () => {
		socketServer = require('http').createServer(app);
		io = require('socket.io')(socketServer);
		var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
		var regex = new RegExp(expression);

		// Listen for socket connection on port 3002
		socketServer.listen(socketPort, function(){
			console.log('Socket server listening on *:3002');
		});

		io.on('connection', function(socket){
			console.log('Socket connection established');
			// Join personalized chat room
			socket.on('join', function(data){
				console.log("JOIN START")
				console.log(data.website)
				console.log(data.id);
				console.log(data.type)
				if (data.id) {
					socket.join(data.id);
				}
				// stores in active_entities mongo collection
				if (data.website && (data.website).match(regex)) {

			        new_entity_dict = { socket_id: data.id, entity_type: data.type, website: data.website, is_chatting: false, is_waiting: false };
					mongo.storeData("active_entities", new_entity_dict);
				}
				console.log("JOIN END")

				// TODO: check for waiting users on the same webpage if helper is joining
	      // if (data.type == "Helper") {
	      //  var waiting_user_socket_id = await getWaitingUser(data.website);
	      //  if (waiting_user_socket_id !== null) {
	      //    // have the helper send an initialization message, as in below? 
	      //  }
	      // }
			});

			socket.on('leave', function(data) {
				console.log("LEAVE START");
				socket.leave(data.id);
				console.log(data.id);
				if (data.website && (data.website).match(regex)) {
					mongo.removeEntity(data.id);
				}
				console.log("LEAVE END")
			});
			

			// Send message
			socket.on('message', async function(data) {
				console.log("MESSAGE START")
				console.log(data.msg)
				if (!data.callbackID){
					console.log("First Message");
					console.log("passed in website is: " + data.website);
					var helper_id = await mongo.getHelper(data.id, data.website)
					console.log(helper_id);

			        // store msg in db
			        new_msg = { to: helper_id, from: data.id, message: data.msg, time: get_date() };
			        mongo.storeData("message_logs", new_msg);
							io.to(helper_id).emit('message', {msg: data.type + ": " + data.msg, callbackID: data.id});
							io.to(data.id).emit('message', {msg: data.type + ": " + data.msg, callbackID: helper_id});				
				}
				else {
			        // store msg in db 
			        new_msg = { to: data.callbackID, from: data.id, message: data.msg, time: get_date() };
			        mongo.storeData("message_logs", new_msg);
							io.to(data.callbackID).emit('message', {msg: data.type + ": " + data.msg, callbackID: data.id});
							io.to(data.id).emit('message', {msg: data.type + ": " + data.msg, callbackID: data.callbackID});
				}
				console.log("MESSAGE END")
			});

			// Remove Dead User
			socket.on('disconnecting', function(data) {
				console.log("DISCONNECT START");
				console.log(data.id);
				if (data.website && (data.website).match(regex)) {
					mongo.removeEntity(data.id);
				}
				console.log("DISCONNECT END");
			})
		});
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////// helpers /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// YYYY:MM:DD:HH:MM:SS
function get_date() { return (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':');}
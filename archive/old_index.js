
var express = require('express');
var bodyParser = require('body-parser'); 
var cors = require('cors');
const MongoClient = require('mongodb').MongoClient
const socketPort = 3002
const serverPort = 3000
var app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); 

var db;
var socketServer;
var io;
var http_server;

// server code initializes by making connection to mongo 
// and initializing socket and server info after connection
MongoClient.connect('mongodb://server:wah123@ds127044.mlab.com:27044/wah_db', async (err, client) => {
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
// Creates new socket server
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
			console.log("JOIN START")
			if (data.id) {
				socket.join(data.id);
			}
			// stores in active_entities mongo collection
			new_entity_dict = { sock_id: data.id, entity_type: data.type, is_chatting: false, is_waiting: false };
			//storeData("active_entities", new_entity_dict);
			storeDataSimple("active_entities", new_entity_dict);
			console.log("JOIN END")
		});
			// TODO: check for waiting users on the same webpage if helper is joining
		// if (data.type == "Helper") {
		//  var waiting_user_sock_id = await getWaitingUser(data.website);
		//  if (waiting_user_sock_id !== null) {
		//    // have the helper send an initialization message, as in below? 
		//  }
		// }
		
		

		// Send message
		socket.on('message', async function(data) {
			console.log("MESSAGE START")
			console.log(data.msg)
			if (!data.callbackID){
				console.log("First Message");
				console.log("passed in website is: " + data.website);
				var helper_id = await getHelper(data.id, data.website)
				console.log(helper_id);
				// store msg in db? 
				new_msg = { to: helper_id, from: data.id, message: data.msg, time: get_date() };
				storeData("message_logs", new_msg);
				io.to(helper_id).emit('message', {msg: data.msg, callbackID: data.id, type: data.type});
				io.to(data.id).emit('message', {msg: data.msg, callbackID: helper_id, type: data.type});				
			}
			else {
				// store msg in db? 
				new_msg = { to: data.callbackID, from: data.id, message: data.msg, time: get_date() };
				storeData("message_logs", new_msg);
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
			removeEntity(socket.id);
			console.log("DISCONNECT END");
		})
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

	app.get('/getAnnotations', async function(req, res) {
	console.log("received getEntityInfo request for website: ");
	console.log(req.query.website);
	var ann_obj = await getWebsiteAnnotations(req.query.website); 
	res.send(ann_obj);
	console.log("serviced getAnnotations request with response: ");
	console.log(ann_obj);
	});

	app.post('/postAnnotation', function(req, res) {
	console.log("received postAnnotation request with body: ");
	console.log(req.body);
	var ann_json = req.body;
	// not sure if this is necessary--depends on if json object is essentially same as dict
	var annotation_dict = {website: ann_json["website"], category: ann_json["category"], text: ann_json["text"], upvotes: 0, downvotes: 0};
	storeData("annotations", annotation_dict);
	console.log("serviced postAnnotation request");
	});
	
	// give socket_id, get entity_type and website
	app.get('/getEntityInfo', async function(req, res) {
	console.log("received getEntityInfo request with socket_id: ");
	console.log(req.query.socket_id);
	var entity_info = await getEntityInfo(req.query.socket_id); 
	console.log(entity_info);
	if (entity_info){
		res.send(entity_info);
	}
	else {
		res.send("Does Not Exist");
	}
	
	console.log("serviced getEntityInfo request with response: ");
	console.log(entity_info);
	});

	app.post('/updateEntityType', function(req, res) {
	console.log("received updateEntityType request with body: ");
	console.log(req.body);
	updateEntityType(req.body.socket_id, req.body.entity_type);
	console.log("serviced updateEntityType request");
	}); 

	app.post('/updateEntityWebsite', function(req, res) {
	console.log("received updateEntityWebsite request with body: ");
	console.log(req.body);
	updateEntityWebsite(req.body.socket_id, req.body.website);
	console.log("serviced updateEntityWebsite request");
	});
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////// mongo query functions ////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// called when a new entity activates the browser extension by clicking a toolbar option ('User', 'Helper')

function storeData(collection_name, document_dict) {
	console.log("STORE START");
	console.log(document_dict.sock_id);
	db.collection('active_entities').findOne({sock_id: document_dict.sock_id}, (err, result) => {
		if (err) { return console.log(err); }
		console.log("FIND START")
		console.log(result);
		console.log("FIND END")
		if (!result) {
			console.log("SAVE START");
			db.collection(collection_name).save(document_dict, (err, result) => {
				if (err) { return console.log(err);}
				console.log("successful storeData call on collection: " + collection_name + " with userID: " + result.ops[0].sock_id); 
				console.log("SAVE END");
			});
		}
		console.log("STORE END");
	});
	
}

function storeDataSimple(collection_name, document_dict) {
	console.log("SIMPLE STORE")
	db.collection(collection_name).save(document_dict, (err, result) => {
		if (err) { return console.log(err);}
		console.log("successful storeData call on collection: " + collection_name + " with userID: " + result.ops[0].sock_id); 
		console.log("SIMPLE STORE END");
	});
}

// used to delete documents matching the query fields in the collection
// NOTE: if want to delete entire collection, call delete with empty find_dict
function deleteData(collection_name, query_fields) {
	db.collection(collection_name).deleteMany(query_fields);  
}

// called to update a document in a given collection
function updateData(collection_name, query_fields, set_fields) {
	db.collection(collection_name).updateOne(query_fields, { $set: set_fields});
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
	// db.collection('active_entities').deleteOne({ sock_id: sock_id }, (err, result) => {
	// 	if (err) { return console.log(err);}
	// 	console.log("successful removeEntity call on ID: " + sock_id); 
	// });
	console.log("REMOVE START (id)")
	db.collection('active_entities').deleteMany({ sock_id: sock_id }, (err, result) => {
		if (err) { return console.log(err);}
		console.log("successful removeEntity call on ID: " + sock_id); 
		console.log("REMOVE END (id)")
	});
}

async function getEntityInfo(sock_id) {
	var waiting_user_find_promise = db.collection('active_entities').findOne({ sock_id: sock_id });
	var user_data = await waiting_user_find_promise;
	if (user_data === null) {
	return null;
	}
	var entity_info = {};
	entity_info["website"] = user_data["website"];
	entity_info["entity_type"] = user_data["entity_type"];
	return entity_info;
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
	console.log("HELPER START")
	console.log(website);
	var helper_find_promise = db.collection('active_entities').findOne({ website: website, is_chatting: false, entity_type: "Helper"});
	var helper_data = await helper_find_promise;
	console.log(helper_data);

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
	console.log("HELPER END")
	return helper_id;
}

// returns object of form:
// [ {category: string, 
//    texts: [ {text: string, 
//              ups: int, 
//        downs: int} ] } ] (sorted in descending order of highest overall score (positive - negative)
async function getWebsiteAnnotations(website) {
	var anns_find_promise = db.collection("annotations").find({ website: website });
	var anns_data = await anns_find_promise.toArray();

	var return_obj = []
	var curr_categories = {}

	anns_data.forEach((ann) => {
	curr_cat = ann["category"];
	if (curr_cat in curr_categories) {
		for (let i = 0; i < return_obj.length; ++i) {
		if (curr_cat === return_obj[i]["category"]) {
			return_obj[i]["texts"].push({text: ann["text"], ups: ann["ups"], downs: ann["downs"]});
			break;
		}
		}
	}
	else {
		curr_categories[curr_cat] = "";
		return_obj.push({category : curr_cat, texts: [{text: ann["text"], ups: ann["ups"], downs: ann["downs"]}]});
	}
	})

	// sort annotations by overall score (positive - negative)
	return_obj.forEach((list) => {
	list["texts"].sort((a, b) => {
		let b_overall = b["ups"] - b["downs"];
		let a_overall = a["ups"] - a["downs"];
		return b_overall - a_overall;
	})
	});

	return return_obj;
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////// helpers /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// YYYY:MM:DD:HH:MM:SS
function get_date() { return (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':');}
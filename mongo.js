///////////////////////////////////////////////////////////////////////////////
/////////////////////// server init + mongo functions /////////////////////////
///////////////////////////////////////////////////////////////////////////////
const MongoClient = require('mongodb').MongoClient
var express_startup;
var db;
const mongoServer = 'mongodb://server:wah123@ds127044.mlab.com:27044/wah_db'

module.exports = {
	// server code initializes by making connection to mongo 
	// and initializing socket and server info after connection
	server_init: () => {
		MongoClient.connect('mongodb://server:wah123@ds127044.mlab.com:27044/wah_db', async (err, client) => {
			if (err) { return console.log(err); }

			// store global db object
			db = client.db('wah_db'); 

			// active_entities schema: [{socket_id: string, entity_type: string, website: string, is_chatting: boolean}]
			db.createCollection('active_entities', {});
			// message_logs schema: [{from: id, to: id, message: string, time: date_string}]
			db.createCollection('message_logs', {});
			// annotations schema: [{website: string, category: string, text: string}]
			db.createCollection('annotations', {});
			console.log("successful connection to Mongo DB");

			express_startup = require('./express');
			express_startup.init_socket_server();
			console.log("successful Socket.IO init");

			express_startup.init_http_server(); 
			console.log("successful http server init"); 
		})
	},

	storeData: (collection_name, document_dict) => {
		console.log("STORE START");
		db.collection(collection_name).findOne(document_dict, (err, result) => {
			if (err) { return console.log(err); }
			console.log("FIND START")
			console.log(result);
			console.log("FIND END")
			if (!result) {
				console.log("SAVE START");
				db.collection(collection_name).save(document_dict, (err, result) => {
					if (err) { return console.log(err);}
					console.log("successful storeData call on collection: " + collection_name); 
					console.log("SAVE END");
				});
			}
			console.log("STORE END");
		});
	},

	storeDataSimple: (collection_name, document_dict) => {
		console.log("SIMPLE STORE")
		db.collection(collection_name).save(document_dict, (err, result) => {
			if (err) { return console.log(err);}
			console.log("successful storeData call on collection: " + collection_name + " with userID: " + result.ops[0].sock_id); 
			console.log("SIMPLE STORE END");
		});
	},

	// used to delete documents matching the query fields in the collection
	// NOTE: if want to delete entire collection, call delete with empty find_dict
	deleteData: (collection_name, query_fields) => {
		db.collection(collection_name).deleteMany(query_fields);  
	},

	// called to update a document in a given collection
	updateData: (collection_name, query_fields, set_fields) => {
		db.collection(collection_name).updateOne(query_fields, { $set: set_fields});
	},

	// called when an entity changes entity_type
	updateEntityType: (socket_id, type) => {
		// change an entity in the mongo collection--either website or type could change
		if (type === "User" || type === "Helper") {
			db.collection('active_entities').updateOne({ sock_id: socket_id }, { $set: {entity_type: type, is_chatting: false, is_waiting: false}});	
		}
	},

	// called when an entity changes website
	updateEntityWebsite: (socket_id, website) => {
		db.collection('active_entities').updateOne({ sock_id: socket_id }, { $set: {website: website, is_waiting: false}});
	},

	updateAnnVote: (_id, vote_type) => {
		var inc_obj = {};
		if (vote_type === "up") {
			inc_obj["ups"] = 1;
		}
		else {
			inc_obj["downs"] = 1;
		}
		db.collection('annotations').updateOne({ _id: _id }, { $inc: inc_obj});
	},

	// called on extension close or user sign out
	removeEntity: (socket_id) => {
		console.log("REMOVE START (id)")
		db.collection('active_entities').deleteMany({ sock_id: socket_id }, (err, result) => {
			if (err) { return console.log(err);}
			console.log("successful removeEntity call on ID: " + socket_id); 
			console.log("REMOVE END (id)")
		});
	},

	getEntityInfo: async (socket_id) => {
		var entity_promise = db.collection('active_entities').findOne({ sock_id: socket_id });
		var entity_resp = await entity_promise;
		if (entity_resp === null) {
			console.log("getEntityInfo didn't find matching socket_id in DB");
			return null;
		}
		return entity_resp;
	},

	// to be used whenever a helper becomes available on a webpage 
	getWaitingUser: async (website, helper_id) => {
		var waiting_user_find_promise = db.collection('active_entities').findOne({ website: website, is_waiting: true});
		var user_data = await waiting_user_find_promise;

		if (user_data === null) {
			console.log("no waiting users on website: " + website);
			return null; 
		}

		db.collection('active_entities').updateOne({ sock_id: user_data["sock_id"] }, { $set: {is_waiting: false}} );
		db.collection('active_entities').updateOne({ sock_id: helper_id }, { $set: {is_chatting: true}} );

		return user_data;
	},

	// called when a user attempts to open a chat
	// will either return idle helper socket_id or save the user as waiting in the db (returning null)
	// NOTE: must be called within async and given await keyword
	getHelper: async (user_socket_id, website, msg) => {
		// find an idle helper 
		console.log("HELPER START")
		console.log(website);
		var helper_find_promise = db.collection('active_entities').findOne({ website: website, is_chatting: false, entity_type: "Helper"});
		var helper_data = await helper_find_promise;
		console.log(helper_data);

		// there are no idle helpers 
		if (helper_data === null) {
			console.log("no idle helpers on same website");

			db.collection('active_entities').updateOne({ sock_id: user_socket_id }, { $set: {is_waiting: true, waiting_msg: msg}});
			return null; 
		}

		// update the idle helper to be in a chat currently
		db.collection('active_entities').updateOne({ sock_id: helper_data["sock_id"] }, { $set: {is_chatting: true}} );
		console.log("HELPER END")
		return helper_data["sock_id"];
	},

	// returns object of form:
	// [ {category: string, 
	//    texts: [ {text: string, 
	//              ups: int, 
	//        downs: int} ] } ] (sorted in descending order of highest overall score (positive - negative)
	getWebsiteAnnotations: async (website) => {
		var anns_find_promise = db.collection("annotations").find({ website: website });
		var anns_data = await anns_find_promise.toArray();

		var return_obj = []
		var curr_categories = {}

		anns_data.forEach((ann) => {
			curr_cat = ann["category"];
			if (curr_cat in curr_categories) {
				for (let i = 0; i < return_obj.length; ++i) {
					if (curr_cat === return_obj[i]["category"]) {
						return_obj[i]["texts"].push({text: ann["text"], ups: ann["ups"], downs: ann["downs"], _id: ann["_id"]});
						break;
					}
				}
			}
			else {
				curr_categories[curr_cat] = "";
				return_obj.push({category : curr_cat, texts: [{text: ann["text"], ups: ann["ups"], downs: ann["downs"], _id: ann["_id"]}]});
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
	},
}
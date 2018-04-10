// Initialize Socket to ServerSocket
const server = 'http://localhost';
const socketPort = 3002;
const apiPort = 3000;
var socket = io(server + ":" + socketPort);
// console.log("BEGIN")
var userData = {}
// On Socket Connection
socket.on('connect', () => {
	// console.log("CONNECTED")

	// Regex for URL validation
	var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var regex = new RegExp(expression);
	userData.type = "User";

	// console.log(socket.id)
	// Join room based on socket.id
	socket.emit('join', {id: socket.id, type: userData.type});

	// Update Database with type User
	$.ajax({
		url: server + ":" + apiPort + '/updateEntityType',
		type:"POST",
		data: JSON.stringify({"socket_id": socket.id, "entity_type": userData.type}),
		contentType:"application/json; charset=utf-8",
		dataType: "text",
		success: postInitial
	});

	function postInitial() {
		// console.log("SUCCESS")

		// Check if socket.id has associated website info
		$.get(server + ":" + apiPort + '/getEntityInfo', {socket_id: socket.id}, function(data) {
			if (data) {
				var website = data.website;
				var type = data.entity_type;
				// console.log(type);
				// console.log(website)
				browser.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
					var activeTab = arrayOfTabs[0];
					var url = activeTab.url;
					// console.log(url);
					if (socket.id && url && url.match(regex)) {
						//socket.emit('leave', {id: socket.id, website: website, type: type});
						socket.emit('join', {id: socket.id, website: tab.url, type: type});
					}
				});
			}
			else {
				browser.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
					var activeTab = arrayOfTabs[0];
					var url = activeTab.url;
					// console.log(url);
					if (socket.id && url && url.match(regex)) {
						//socket.emit('leave', {id: socket.id, website: tab.url, type: type});
						socket.emit('join', {id: socket.id, website: url, type: type});
					}
				});
			}
		});
	}

	function websiteUpdate(tabId, changeInfo, tab){
		if (changeInfo.status == 'complete' && !((tab.url).includes("moz-extension://"))) {
			// console.log("ChangeWebsite");
			// console.log(tab.url)
			if ((tab.url).match(regex)) {
				userData.website = tab.url;
				$.ajax({
					url: server + ":" + apiPort + '/updateEntityWebsite',
					type:"POST",
					data: JSON.stringify({"socket_id": socket.id, "website": tab.url}),
					contentType:"application/json; charset=utf-8",
					dataType: "text"
				});
			}
		}

	}

	function handleMessage(request, sender, sendResponse) {
		if (request.type == "type_change"){
			userData.type = request.msg;
			$.ajax({
				url: server + ":" + apiPort + '/updateEntityType',
				type: "POST",
				data: JSON.stringify({"socket_id": socket.id, "entity_type": request.msg}),
				contentType:"application/json; charset=utf-8",
				dataType: "text"
			});
			sendResponse("User Type Changed");
		}
		else if (request.type == "message_send") {
			if (userData.website) {
				if (userData.callbackID) {
					// console.log("CALLBACK");
					// console.log(userData.website);
					socket.emit('message', {id: socket.id, website: userData.website, type: userData.type, msg: request.msg, callbackID: userData.callbackID});
				}
				else {
					// console.log("INITIAL ISSUE");
					// console.log(userData.website);
					socket.emit('message', {id: socket.id, website: userData.website, type: userData.type, msg: request.msg, callbackID: null});
				}
			}
		} else if (request.type == "check_popup") {
			sendResponse(userData.type);
			console.log(userData.type);
			// console.log("Popup check requested, sending response");
		}
	}

	browser.tabs.onUpdated.addListener(websiteUpdate);
	browser.runtime.onMessage.addListener(handleMessage);
});

socket.on('message', function(data){
	// console.log("RECEIVED");
	// console.log(data.msg);
	userData.callbackID = data.callbackID;
	browser.runtime.sendMessage({type: "message_receive", msg: data.type + ": " + data.msg}, function(response) {
		// console.log(response.msg);
	});
});

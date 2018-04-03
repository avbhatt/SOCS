var socket = io.connect('http://localhost:3002');
var type = (browser.storage.local.get("userType")).then();
if (type == "Helper"){
	socket.emit('join', {id: socket.id, website: $(location).attr('href'), type: "Helper"});
}
else {
	browser.storage.local.set({"userType": "User", website: $(location).attr('href'), id: socket.id});
	socket.emit('join', {id: socket.id, website: $(location).attr('href'), type: "Helper"});
}

function websiteUpdate(tabid, changeInfo, tab){
	var type = (browser.storage.local.get("userType")).then();
	if (type == "Helper"){
		socket.emit('join', {id: socket.id, website: tab.url, type: "Helper"});
	}
	else {
		browser.storage.local.set({"userType": "User", website: $(location).attr('href'), id: socket.id});
		socket.emit('join', {id: socket.id, tab.url, type: "Helper"});
	}
}

browser.tabs.onUpdated.addListener(websiteUpdate)
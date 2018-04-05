var socket = io('http://localhost:3002');
socket.on('connect', () => {
	console.log(socket.id)
	$.get('http://localhost:3000/getEntityInfo', {socket_id: socket.id}, function(data) {
		if (data) {
			var website = data.website;
			var type = data.entity_type;
			console.log(type);
			console.log(website)
			browser.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
				var activeTab = arrayOfTabs[0];
				var url = activeTab.url; 
				console.log(url);
				if (socket.id && url) {
					socket.emit('leave', {id: socket.id, website: website, type: type});
					socket.emit('join', {id: socket.id, website: tab.url, type: type});
				}
			});
		}
		else {
			browser.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
				var activeTab = arrayOfTabs[0];
				var url = activeTab.url; 
				console.log(url);
				if (socket.id && url) {
					//socket.emit('leave', {id: socket.id, website: tab.url, type: type});
					socket.emit('join', {id: socket.id, website: tab.url, type: type});
				}
			});
		}	
	});		


	function websiteUpdate(tabid, changeInfo, tab){
		console.log("ChangeWebsite");
		console.log("TAB");
		console.log(tab.url)
		$.get('http://localhost:3000/getEntityInfo', {socket_id: socket.id}, function(data) {
			var website = data.website;
			var type = data.entity_type;
			console.log(type)
			console.log(website)
			if (socket.id && website) {
				socket.emit('leave', {id: socket.id, website: tab.url, type: type});
				socket.emit('join', {id: socket.id, website: tab.url, type: type});
			}
		});
	}

// function typeUpdate(changes, areaName){
// 	if (areaName == "local"){
// 		if (changes.tab) {

// 		}
// 	}
// }

// browser.storage.onChanged.addListener(typeUpdate);
	browser.tabs.onUpdated.addListener(websiteUpdate);
});
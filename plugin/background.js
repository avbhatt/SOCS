var socket = io('http://localhost:3002');
socket.on('connect', () => {
	console.log(socket.id)
	var userThen = browser.storage.local.get("userType");
	userThen.then((resolve, reject) => {
		var type = resolve.userType;
		console.log(type);
		browser.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
			var activeTab = arrayOfTabs[0];
     		var url = activeTab.url; 
     		console.log(url);
     		browser.storage.local.set({tab: url});
			if (type == "Helper"){
				socket.emit('join', {id: socket.id, website: url, type: "Helper"});
			}
			else {
				browser.storage.local.set({userType: "User"});
				socket.emit('join', {id: socket.id, website: url, type: "User"});
			}
		});
	});

	function websiteUpdate(tabid, changeInfo, tab){
		console.log("ChangeWebsite");
		console.log("TAB");
		console.log(tab.url)
		browser.storage.local.set({tab: tab.url});
		browser.storage.local.get("userType").then((resolve, reject) => {
			if (socket.id && tab.url) {
				console.log("BG 27: " + socket.id);
				socket.emit('leave', {id: socket.id, website: tab.url, type: "Helper"});
				var type = resolve.userType;
				if (type == "Helper"){
					socket.emit('join', {id: socket.id, website: tab.url, type: "Helper"});
				}
				else {
					browser.storage.local.set({userType: "User"});
					socket.emit('join', {id: socket.id, website: tab.url, type: "User"});
				}
			}
		});
	}

	function typeUpdate(changes, areaName){
		if (areaName == "local"){
			if (changes.tab) {

			}
		}
	}

	browser.storage.onChanged.addListener(typeUpdate);
	browser.tabs.onUpdated.addListener(websiteUpdate);
});
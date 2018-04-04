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
     		broswer.storage.local.set({tab: url});
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
		broswer.storage.local.set({tab: changeInfo.url});
		browser.storage.local.get("userType").then((resolve, reject) => {
			var type = resolve.userType;
			if (type == "Helper"){
			socket.emit('join', {id: socket.id, website: changeInfo.url, type: "Helper"});
		}
		else {
			browser.storage.local.set({userType: "User"});
			socket.emit('join', {id: socket.id, website: changeInfo.url, type: "Helper"});
		}
		});
		
	}
	browser.tabs.onUpdated.addListener(websiteUpdate)
});
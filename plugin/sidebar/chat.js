$(function (){
	var background = browser.runtime.getBackgroundPage();
	background.then((fulfilled, rejected) => {
		var socket = fulfilled.socket;
		// connect to local storage to get type, default to user
		var userThen = browser.storage.local.get("userType");
		userThen.then((fulfilled, rejected) => {
			var user = fulfilled.userType;
			var recData = {};
			$('form').submit(function(){
				if (recData.callbackID){
					socket.emit('message', {id: socket.id, website: $(location).attr('href'), type: user, msg: $('#m').val(), callbackID: recData.callbackID})
				}
				else {
					socket.emit('message', {id: socket.id, website: $(location).attr('href'), type: user, msg: $('#m').val(), callbackID: null});
				}
				$('#m').val('');
				return false;
			});
			socket.on('message', function(data){
				console.log("RECEIVED")
				$('#messages').append($('<li>').text(data.msg));
				recData.callbackID = data.callbackID;
			});
		});
	});
});


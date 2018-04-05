$(function (){
	var background = browser.runtime.getBackgroundPage();
	background.then((fulfilled, rejected) => {
		var socket = fulfilled.socket;
		// connect to local storage to get type, default to user
		var recData = {};
		$('form').submit(function(){
			console.log($('#m').val());
			$.get('http://localhost:3000/getEntityInfo', {socket_id: socket.id}, function(data) {
				var user = data.entity_type;
				var website = data.website;
				console.log(user);
				console.log(website);
				if (recData.callbackID) {
					console.log("CALLBACK")
					socket.emit('message', {id: socket.id, website: website, type: user, msg: $('#m').val(), callbackID: recData.callbackID})
				}
				else {
					console.log(website)
					socket.emit('message', {id: socket.id, website: website, type: user, msg: $('#m').val(), callbackID: null});
				}
				$('#m').val('');
				return false;
			});
		});	
		socket.on('message', function(data){
			console.log("RECEIVED");
			console.log(data.msg);
			$('#messages').append($('<li>').text(data.msg));
			recData.callbackID = data.callbackID;
		});
	});
});

$(function (){
	// connect to local storage to get type, default to user
	var userType = (browser.storage.local.get("userType")).then();

	var recData;

	$('form').submit(function(){
		if (recData.callbackID){
			socket.emit('message', {id: socket.id, website: $(location).attr('href'), type: userType, msg: $('#m').val(), callbackID: recData.callbackID})
		}
		else {
			socket.emit('message', {id: socket.id, website: $(location).attr('href'), type: userType, msg: $('#m').val(), callbackID: null});
		}
		$('#m').val('');
		return false;
	});
	
	socket.on('message', function(data){
		$('#messages').append($('<li>').text(data.msg));
		recData.callbackID = data.callbackID;
	});

});


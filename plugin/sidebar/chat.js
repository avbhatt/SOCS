$(function (){
	// connect to socket.io
	var socket = io.connect('http://localhost:3002');

	// connect to local storage to get type, default to user
	var userType = getType();
	var x = userType();

	var recData;
	// join personal room
	socket.emit('join', {id: socket.id, website: $(location).attr('href'), type: x});

	if (x){
		socket.emit('first message', {id: socket.id, website: $(location).attr('href'), type: x, msg: "I'm in need of help!"});
	}

	$('form').submit(function(){
		if (recData.callbackID){
			socket.emit('message', {id: socket.id, website: $(location).attr('href'), type: x, msg: $('#m').val(), callbackID: recData.callbackID})
		}
		else {
			socket.emit('message', {id: socket.id, website: $(location).attr('href'), type: x, msg: $('#m').val()});
			$('#m').val('');
		}
		return false;
	});
	socket.on('message', function(data){
		$('#messages').append($('<li>').text(data.msg));
		recData.callbackID = data.callbackID;
	});

	function getType(){
		
	}

});


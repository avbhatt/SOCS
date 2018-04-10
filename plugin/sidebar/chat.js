var type = "User"
function handleMessage(request, sender, sendResponse){
	if (request.type == "message_receive") {
		console.log(request.msg);
		$('#input').css("display", "inline");
		$('#user').css("display", "none");
		$('#helper').css("display", "none");
		$('#messages').append($('<li>').text(request.msg));
		sendResponse("Received Message");
	}
	else if (request.type == "chat_view") {
		console.log(request.msg)
		if (request.msg == "Helper") {
			type = "Helper";
			$('#user').css("display", "none");
			$('#helper').css("display", "inline");
		}
		else {
			type = "User";
			$('#helper').css("display", "none");
			$('#user').css("display", "inline");
		}
	}
	
}

browser.runtime.onMessage.addListener(handleMessage);
console.log("SIDEBAR RELOAD");
$('form').submit(function(){
	console.log("SUBMIT");
	var msg = $('#m').val();
	console.log(msg);
	browser.runtime.sendMessage({type: "message_send", msg: msg}, function(response) {
		console.log(response.msg);
	});
	$('#m').val('');
	return false;
});
$('#close').click(function(){
	console.log("Chat closed");
	$('#input').css("display", "none");
	if (type == "User") {
		$('#user').css("display", "inline");
	}
	else if (type == "Helper") {
		$('#helper').css("display", "inline");
	}
	browser.runtime.sendMessage({type: "close"}, function(response) {
		console.log(response.msg);
	});
	$('#messages').html('');
});
$('#help').click(function(){
	console.log("Help Needed!");
	$('#input').css("display", "inline");
	$('#user').css("display", "none");
	$('#helper').css("display", "none");
	browser.runtime.sendMessage({type: "message_send", msg: "Needs help!"}, function(response) {
		console.log(response.msg);
	});
});
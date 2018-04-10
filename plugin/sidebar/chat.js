function handleMessage(request, sender, sendResponse){
	if (request.type == "message_receive") {
		console.log(request.msg);
		$('#input').css("display", "inline");
		$('#help').css("display", "none");
		$('#messages').append($('<li>').text(request.msg));
	}
	sendResponse("Received Message");
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
	$('#help').css("display", "inline");
	browser.runtime.sendMessage({type: "close"}, function(response) {
		console.log(response.msg);
	});
	$('#messages').html('');
});
$('#help').click(function(){
	console.log("Help Needed!");
	$('#input').css("display", "inline");
	$('#help').css("display", "none");
	browser.runtime.sendMessage({type: "message_send", msg: "Needs help!"}, function(response) {
		console.log(response.msg);
	});
});
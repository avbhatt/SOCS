function handleMessage(request, sender, sendResponse){
	if (request.type == "message_receive") {
		console.log(request.msg);
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
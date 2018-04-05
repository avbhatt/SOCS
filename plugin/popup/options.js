$(function() {
	var background = browser.runtime.getBackgroundPage();
	background.then((fulfilled, rejected) => {
		var socket = fulfilled.socket;
		$("profile-select").change(function () {
			var type = $(this).val(); 
			$.post('http://localhost:3000/updateEntityType'. {socket_id: socket.id, entity_type: type});
		});
	});
});

$(function() {
	console.log("OPTION");
	$("#profile-select").change(function () {
		var type = $(this).val(); 
		console.log(type);
		browser.runtime.sendMessage({type: "type_change", msg: type}, function(response) {
			console.log(response.msg);
		});
	});
});

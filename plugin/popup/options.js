$(function() {
	console.log("OPTION")
	$("#profile-select").change(function () {
		var type = $(this).val();
		console.log(type);
		browser.runtime.sendMessage({type: "type_change", msg: type}, function(response) {
			console.log(response.msg);
		});
	});

	// selected option persists

	browser.runtime.sendMessage({type: "check_popup"}, function(response) {
		console.log(response);
		$("#profile-select option").each(function() {
		  if($(this).text() == response) {
		    $(this).attr('selected', 'selected');
		  }
		})
	});
});

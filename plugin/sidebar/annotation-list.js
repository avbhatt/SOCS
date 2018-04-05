//var currentUrl = window.location.href;
var currentUrl = "https://en.wikipedia.org/wiki/Static_web_page";
// form a GET request to the API, getting all annotations from a given url
// assume response is an array of dicts or something
// tempResponse is just placeholder data
var tempResponse = [{content: [{text: "Dog sleeping on grass",
                                ups: 5,
                                downs: 0}],
                     category: "image",
                     element: "#pretend-id"}
                   ];

// Renders an
$(function() {
  // call getWebsitesAnnotations(currentUrl)
  // route: /getAnnotations

  // $.get("[????]/getAnnotations?website=" + currentUrl, function (data) {
  //
  //   tempResponse = data;
  // });

  tempResponse.forEach(function(elem) {
    var annotationItem = $("<li></li>").text(elem.content[0].text);

    


  });


  $('#annotation-wrapper').append()

  // when user votes, update number to be saved in db, but don't necessarily propagate update across everything

});

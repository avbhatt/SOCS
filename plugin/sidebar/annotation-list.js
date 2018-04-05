//var currentUrl = window.location.href;
var currentUrl = "https://en.wikipedia.org/wiki/Static_web_page";
// tempResponse is just placeholder data


// notes:
//    category: one of "image", "video", or "keyboard"
//
var tempResponse = [{content: [{text: "Dog sleeping on grass",
                                ups: 5,
                                downs: 0}],
                     category: "image",
                     element: "#pretend-id"},
                     {content: [{text: "Dog barking at grass for 5 seconds, then playing with a toy",
                                 ups: 5,
                                 downs: 0}],
                      category: "video",
                      element: "#pretend-id"},
                      {content: [{text: "Login form",
                                  ups: 5,
                                  downs: 0}],
                       category: "keyboard",
                       element: "#pretend-id"}
                   ];
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
   coll[i].addEventListener("click", function() {
       this.classList.toggle("active");
       var content = this.nextElementSibling;
       if (content.style.display === "block") {
           content.style.display = "none";
       } else {
           content.style.display = "block";
       }
   });
}


// Renders an
$(function () {
  // call getWebsitesAnnotations(currentUrl)
  // route: /getAnnotations

  // $.get("[????]/getAnnotations?website=" + currentUrl, function (data) {
  //
  //   tempResponse = data;
  // });
  tempResponse.forEach(function(elem) {
    var $annotationItem = $("<li></li>").text(elem.category + ": " + elem.content[0].text);
    $annotationItem.append($("<br aria-hidden='true'>"));
    $annotationItem.append($("<a>[upvote]</a>"));
    $annotationItem.append($("<a>[downvote]</a>"));
    if (elem.category == "image") {
      $('#img').css("display", "block")
      $("#img").next().children('ul').append($annotationItem);
    } else if (elem.category == "video") {
      $('#vid').css("display", "block")
      $("#vid").next().children('ul').append($annotationItem);
    } else if (elem.category == "keyboard") {
      $('#keyb').css("display", "block")
      $("#keyb").next().children('ul').append($annotationItem);
    }


  });

  // when user votes, update number to be saved in db, but don't necessarily propagate update across everything

});

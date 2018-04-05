//var currentUrl = window.location.href;
var currentUrl = "https://en.wikipedia.org/wiki/Static_web_page";
// tempResponse is just placeholder data


// notes:
//    category: one of "image", "video", or "keyboard"
//
// var tempResponse = [{"category":"image","texts":[{"text":"do what want","ups":100,"downs":13},{"text":"click there and wut","ups":8,"downs":7},{"text":"click there and here","ups":4,"downs":9},{"text":"click there and here","ups":2,"downs":72}]},{"category":"video","texts":[{"text":"click there and here","ups":22,"downs":7},{"text":"click there and here","ups":9,"downs":4}]},{"category":"keyboard","texts":[{"text":"click there and can't","ups":3,"downs":2},{"text":"please click now","ups":1,"downs":2},{"text":"ok not there though","ups":34,"downs":73}]}];


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

// takes in array of objects
// returns unordered list element with list elements within it
function createList (texts) {
  var $temp_ul = $("<ul></ul>")
  texts.forEach(function (content) {
    var $annotationItem = $("<li></li>").text(content.text);
    $annotationItem.append($("<br aria-hidden='true'>"));
    $annotationItem.append($("<a href='#'>" + content.ups + "[upvote]</a>"));
    $annotationItem.append($("<a href='#'>" + content.downs + "[downvote]</a>"));
    $temp_ul.append($annotationItem);
  })

  return $temp_ul

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
    if (elem.category == "image") {
      $('#img').css("display", "block")
      var $ul = createList(elem.texts);
      $("#img").next().append($ul);
    } else if (elem.category == "video") {
      $('#vid').css("display", "block")
      var $ul = createList(elem.texts);
      $("#vid").next().append($ul);
    } else if (elem.category == "keyboard") {
      $('#keyb').css("display", "block")
      var $ul = createList(elem.texts);
      $("#keyb").next().append($ul);
    }
  });

  // when user votes, update number to be saved in db, but don't necessarily propagate update across everything

});

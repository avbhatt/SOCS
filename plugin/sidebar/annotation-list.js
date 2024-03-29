//currentUrl = "fuzzyporgs.com"
// notes:
//    category: one of "image", "video", or "keyboard"
//
// var tempResponse = [{"category":"image","texts":[{"text":"do what want","ups":100,"downs":13},{"text":"click there and wut","ups":8,"downs":7},{"text":"click there and here","ups":4,"downs":9},{"text":"click there and here","ups":2,"downs":72}]},{"category":"video","texts":[{"text":"click there and here","ups":22,"downs":7},{"text":"click there and here","ups":9,"downs":4}]},{"category":"keyboard","texts":[{"text":"click there and can't","ups":3,"downs":2},{"text":"please click now","ups":1,"downs":2},{"text":"ok not there though","ups":34,"downs":73}]}];
var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
var regex = new RegExp(expression);
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
    $annotationItem.append($("<a href='#' aria-label='" + content.ups + "upvotes'>" + content.ups + "↑</a>"));
    $annotationItem.append("&nbsp;");
    $annotationItem.append($("<a href='#' aria-label='" + content.downs + "downvotes'>" + content.downs + "↓</a>"));
    $temp_ul.append($annotationItem);
  })
  return $temp_ul
}

function refetchWebsite(tabId, changeInfo, tab){
  console.log("???");
  if (changeInfo.status == 'complete' && !((tab.url).includes("moz-extension://"))) {
    // console.log("ChangeWebsite");
    // console.log(tab.url)
    $("#img").next().empty();
    $("#keyb").next().empty();
    $("#vid").next().empty();


    console.log("inside changeinfo");
    if ((tab.url).match(regex)) {
      console.log("inside taburl");
      console.log(tab.url);
      currentUrl = tab.url;
      $.ajax({
        url: "http://localhost:3000/getAnnotations",
        data: {website: currentUrl},
        dataType: "json",
        async: false,
        success: function(data) {
          console.log(data);
          var tempResponse = data.content;
          console.log(tempResponse);
          console.log(tempResponse[0])
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
        },
        error: (error) => {
          console.log("failed to make ajax call");
          console.log(error);
        }
      });
    }
  }
}

// Renders the completed annotations list for this webpage
$(function () {
  browser.tabs.onUpdated.addListener(refetchWebsite);
});

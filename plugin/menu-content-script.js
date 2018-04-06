var url = window.location.href;

window.addEventListener("mousedown", function(event){
    //right click
    if(event.button == 2) {
        clicked = event.target;
    }
}, true);

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request == "get_url") {
    sendResponse({url: url})
  }
  // Getting the html element
  // if(request == "get_url") {
  //   tag = clicked.tagName
  //   switch (tag) {
  //     case "IMG":
  //       sendResponse({tag: tag, src: clicked.src});
  //       break;
  //     case "INPUT":
  //       sendResponse({tag: tag, name: clicked.name});
  //       break;
  //     default:
  //       sendResponse({tag: tag, value: clicked.innerHTML});
  //   }
  // }
});

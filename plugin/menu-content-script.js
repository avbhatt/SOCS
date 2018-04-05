var clicked_element = null;

window.addEventListener("mousedown", function(event){
    //right click
    if(event.button == 2) {
        clicked_element = event.target;
    }
}, true);

browser.contextMenus.onClicked.addListener(() => {
  console.log("HERE");
  browser.browserAction.openPopup();
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == "get_clicked_element") {
      tag = clicked_element.tagName
      switch (tag) {
        case "IMG":
          sendResponse({tag: tag, src: clicked_element.src});
          break;
        case "INPUT":
          sendResponse({tag: tag, name: clicked_element.name});
          break;
        default:
          sendResponse({tag: tag, value: clicked_element.innerHTML});
      }
    }
});

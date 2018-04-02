var clicked_element = null;

window.addEventListener("mousedown", function(event){
    //right click
    if(event.button == 2) {
        clicked_element = event.target;
    }
}, true);

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == "get_clicked_element") {
        sendResponse({tag: clicked_element.tagName, value: clicked_element.innerHTML});
    }
});

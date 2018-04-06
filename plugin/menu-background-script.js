var url = ''

function onCreated() {
  if (browser.runtime.lastError) {
    console.log('Error: ${browser.runtime.lastError}');
  }
  else {
    console.log("Item created successfully");
  }
}

function onError(error) {
  console.log('Error: ${error}');
}

browser.contextMenus.create({
  id: "mark-issue",
  title: "Mark Issue!",
  contexts: ["all"],
}, onCreated);

browser.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "mark-issue":
      browser.tabs.sendMessage(tab.id, "get_url", function(url_msg) {
          url = url_msg['url']
          send_message()
      });
      break;
  }
});

function send_message() {
  var background = browser.runtime.getBackgroundPage();
  background.then((fulfilled, rejected) => {
    // Update this with whatever server we end up using
    var socket = io.connect('http://localhost:3002');
    socket.on('connect', function() {
      console.log('Connected!');
			socket.emit('message', {id: socket.id, website: url, type: 'user', msg: 'Hello, I need some help!', callbackID: null});
    });
  })
};

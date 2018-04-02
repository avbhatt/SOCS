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
      browser.tabs.sendMessage(tab.id, "get_clicked_element", function(clicked_element) {
          console.log(clicked_element)
      });
      break;
  }
})

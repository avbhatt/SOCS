var annotate_btn = document.getElementById("open-annotate")

annotate_btn.addEventListener("click", function() {
  browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
      browser.tabs.executeScript(tabs[0].id, {
          file: "../annotation-form.js"
      }, function(){
          browser.tabs.sendMessage(tabs[0].id,{
              msg: "submit_annotation"
          });
      });
  });
})

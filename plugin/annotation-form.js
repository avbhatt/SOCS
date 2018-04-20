var cancel;
var submit;
const website = window.location.href;
const server = 'http://localhost';
const apiPort = 3000;


browser.runtime.onMessage.addListener(function(request) {
  if (request.msg == "submit_annotation") {
    // Check if form is already present
    if (document.getElementById("annotation-form-div")) {
      return;
    }
    var div = document.createElement('div');
    document.body.appendChild(div);
    div.id = 'annotation-form-div'
    var form =
    `
    <form id="annotation-form" method="post">
      <h2>Submit an Annotation</h2>
      <div id="annotation-form-content">
        <label for="annotation-category">Category: </label>
        <select id="annotation-category">
          <option value="image">Image Annotations</option>
          <option value="video">Video Annotations</option>
          <option value="keyboard">Keyboard Annotations</option>
        </select>
        <!-- or <input type="text" id="annotation-category" name="custom-category" placeholder="Custom category name"/> -->
        <br />
        <label for="annotation-text">Annotation Text: </label><br />
        <textarea id="annotation-text" name="annotation-text" rows="5" style="width:100%; max-width:100%" required></textarea><br />
        <button type="submit" class="annotation-btn" id="annotation-submit">Submit</button>
        <button type="button" class="annotation-btn" id="annotation-cancel">Cancel</button>
      </div>
    </form>
    `
    $('#annotation-form-div').append(form);
    $('#annotation-form-div').css({'position':'fixed', 'top':0, 'left':0, 'width':'100%', 'height':'100%', 'background':'rgba(0,0,0,0.4)', 'z-index':10000});
    $('#annotation-form').css({'margin':'15% auto','padding':'10px 20px', 'width':'50%','color':'black','background':'white', 'font':'14px Helvetica, Arial, sans-serif;'});
    $('#annotation-form-content').css('line-height','200%');
    $('.annotation-btn').css({'background':'#4ed2dd','border':'none','padding':'10px 10px','margin-top':'5px','text-align':'center','font-size':'14px','font-weight':'bold'});
    $('#annotation-cancel').css({'background':'#ffffff','float':'right','border':'1px solid gray','font-weight':'normal'});

    // Remove upon clicking cancel or anywhere outside the form
    cancel = document.getElementById("annotation-cancel");
    cancel.addEventListener("click", function() {
      $('#annotation-form-div').remove();
    })

    window.onclick = function(event) {
      if (event.target == document.getElementById("annotation-form-div")) {
        $('#annotation-form-div').remove();
      }
    }

    $("#annotation-form").on("submit", function(){
      var category = document.getElementById("annotation-category").value;
      var text = document.getElementById("annotation-text").value;
      console.log("in annotation-form submit")
      browser.runtime.sendMessage({type: "annotation_submitted", msg: JSON.stringify({"website": website, "category": category, "text": text})}, function(response) {
    		console.log(response.msg);
    	});
    })
  }
});

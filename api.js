///////////////////////////////////////////////////////////////////////////////
////////////////////// server / routing functions /////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var http_server;
const serverPort = 3000;
var mongo = require('./mongo');

module.exports = {
	// Create HTTP server for node application 
	init_http_server: () => {
		http_server = require('http').Server(app);

		// Node application will be running on 3000 port
		http_server.listen(serverPort, function(){
			console.log('HTTP server listening on *:3000');
		});

		app.get('/', function(req, res){
			res.sendFile(__dirname + '/index.html')
		});

		app.get('/getAnnotations', async function(req, res) {
		    console.log("received getEntityInfo request for website: ");
		    console.log(req.query.website);
		    var ann_obj = await mongo.getWebsiteAnnotations(req.query.website); 
		    res.send(ann_obj);
		    console.log("serviced getAnnotations request with response: ");
		    console.log(ann_obj);
		});

		app.post('/postAnnotation', function(req, res) {
		    console.log("received postAnnotation request with body: ");
		    console.log(req.body);
		    var ann_json = req.body;
		    var annotation_dict = {website: ann_json["website"], category: ann_json["category"], text: ann_json["text"], upvotes: 0, downvotes: 0};
		    mongo.storeData("annotations", annotation_dict);
		    console.log("serviced postAnnotation request");
		});

		app.get('/getEntityInfo', async function(req, res) {
		    console.log("received getEntityInfo request with socket_id: ");
		    console.log(req.query.socket_id);
		    var entity_info = await mongo.getEntityInfo(req.query.socket_id); 
		    res.send(entity_info);
		    console.log("serviced getEntityInfo request with response: ");
		    console.log(entity_info);
		});

		app.post('/updateEntityType', function(req, res) {
		    console.log("received updateEntityType request with body: ");
		    console.log(req.body);
		    mongo.updateEntityType(req.body.socket_id, req.body.entity_type);
		    console.log("serviced updateEntityType request");
		});
	}
}
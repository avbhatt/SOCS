// start on mongo.js file because server needs to establish 
// db connection before spinning up socket and api connections
var mongo = require('./mongo');
mongo.server_init(); 

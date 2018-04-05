// start on mongo.js file because need to establish 
// db connection before spinning up socket and api servers
var mongo = require('./mongo');
mongo.server_and_db_init(); 
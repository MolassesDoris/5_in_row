var http = require('http');
// var querystring = require('querystring');
var server = http.createServer().listen(3000);

var ConnectGame = require('./game').game;
var game = new ConnectGame();

server.on('request', function(req, res){
  if (req.method == 'POST'){
    console.log('Received Post')
    var body = '';
  }
  req.on('data', function(data){
    body+=data;
  });
  req.on('end', function(){
    body = JSON.parse(body);
    var type = body['type'];
    if(type == 'name'){
      console.log('Your name is ' + body['name']);
    }
  });
});
console.log('Listening on port 3000')

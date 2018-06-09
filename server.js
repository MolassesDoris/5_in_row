var http = require('http');
// var querystring = require('querystring');
var server = http.createServer().listen(3000);

var ConnectGame = require('./game').game;
var game = new ConnectGame();

var onJoin = function(body,res){
  console.log(body['name'], ' has joined the lobby');
  game.createNewPlayer(body['name'])
  var ready = game.isReadyToPlay();
  if(ready == false){
    var message = 'You have joined the lobby but we are waiting for another to join';
    var postData = JSON.stringify({
      msg: message,
      type: 'message'
    });
    console.log(postData)
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(postData);
  }else{
    game.display()
  }
}

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
    if(type == 'join'){
      onJoin(body, res)
      }
  });
});
console.log('Waiting for Players to Join')

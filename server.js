var http = require('http');
// var querystring = require('querystring');
var server = http.createServer().listen(3000);

var ConnectGame = require('./game').game;
var game = new ConnectGame();

var onJoin = function(body,res){
  console.log(body['data'], ' has joined the lobby');
  game.createNewPlayer(body['data'], res);
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
      onJoin(body, res);
    }else if(type == 'move'){
      console.log('Received Move')
      var move = body['data'];
      game.makeMove(move);
    }
  });
});
console.log('Waiting for Players to Join')

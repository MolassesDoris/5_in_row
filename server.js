var http = require('http');
var ConnectGame = require('./game').game;

var game = new ConnectGame();
var server = http.createServer().listen(3000);
console.log('Waiting for Players to Join');

var handleJoin = function(name,res){
  console.log(name, ' has joined the lobby');
  game.createNewPlayer(name, res);
  }

var getPlayerFromToken = function(token){
  var parsedToken = game.parseToken(token);
  var player = game.getPlayerWithName(parsedToken[0]);
  return player;
}

var handleValidMove = function(player, move, res){
  player.setResponseLoc(res);
  game.makeMove(move, player);
}

var handleNotifyMe = function(token, res){
  var player = getPlayerFromToken(token);
  player.setResponseLoc(res);
}

var handleMove = function(move, token, res){
  var player = getPlayerFromToken(token);
  if(game.checkIfValidMove(move)){
    handleValidMove(player, move, res);
  }else{
    game.notifyInvalid(player,res);
  }
}

var handlePing = function(playerName, res){
  var player = game.getPlayerWithName(playerName);
  player.receivedPing = true;
  player.pingResponse = res;
}

server.on('request', function(req, res){
  if (req.method == 'POST'){
    var body = '';
  }
  req.on('data', function(data){
    body+=data;
  });
  req.on('end', function(){
    body = JSON.parse(body);
    var type = body['type'];
    switch(type){
      case 'join':
        handleJoin(body['data'], res);
        break;
      case 'notifyMe':
        handleNotifyMe(body['token'], res);
        break;
      case 'move':
        var move = parseInt(body['data']);
        handleMove(move, body['token'], res);
        break;
      case 'ping':
        handlePing(body['name'], res);
        break;
    }
  });
});

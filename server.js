var http = require('http');
// var querystring = require('querystring');
var server = http.createServer().listen(3000);

var ConnectGame = require('./game').game;
var game = new ConnectGame();

var onJoin = function(body,res){
  console.log(body['data'], ' has joined the lobby');
  game.createNewPlayer(body['data'], res);
  }

var getPlayerFromToken = function(token){
  var parsedToken = game.parseToken(token);
  var player = game.getPlayerWithName(parsedToken[0]);
  return player;
}

var handleValidMove = function(player, move, res){
  game.makeMove(move, player);
  var gridData = JSON.stringify({
    grid : game.getPrintableGrid(),
    type: 'moveSuccess',
    token: game.generateToken(player),
    name: player.name,
    id: player.id,
    icon: player.gameIcon
  });
  res.write(gridData);
  res.end();
}

server.on('request', function(req, res){
  if (req.method == 'POST'){
    console.log('Received Post')
    var body = '';
  }
  req.on('data', function(data){
    body+=data;
  });
  req.on("close", function(err) {
    // request closed unexpectedly
    console.log('Closed unexpectedly')
  });
  req.on('end', function(){
    body = JSON.parse(body);
    var type = body['type'];
    if(type == 'join'){
      onJoin(body, res);
    }else if(type == 'notifyMe'){
      var player = getPlayerFromToken(body['token']);
      player.setResponseLoc(res);
    }else if(type == 'move'){
      console.log('Received Move')
      var move = parseInt(body['data']);
      var player = getPlayerFromToken(body['token']);
      if(game.checkIfValidMove(move)){
        handleValidMove(player, move, res);
      }else{
        game.notifyInvalid(player,res);
      }
    }
  });
});
console.log('Waiting for Players to Join')

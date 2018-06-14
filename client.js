var http = require('http');
var stdin = process.stdin, stdout = process.stdout
var options = {
  hostname : 'localhost',
  port: 3000,
  method: 'POST',
  headers: {
        "Content-Type": "application/json",
    }
};

var createRequest = function(){
  var req = http.request(options, function(res){

    res.setEncoding('utf8');
    var body = ''

    res.on('data', function(data){
      body = data;
    });

    res.on('end', function(){
      body = JSON.parse(body);
      var type = body['type'];

      switch(type){
        case 'moveQuery':
          handleMoveQuery(body);
          break;
        case 'joinSuccess':
          handleJoinSuccess(body);
          break;
        case 'moveSuccess':
          handleMoveSuccess(body);
          break;
        case 'moveFailure':
          handleMoveFailure(body);
          break;
        case 'gameOver':
          console.log('Game Over');
          handleGameOver(body);
          break;
      }

    });
  });

  req.on('error', function(e){
    console.log('Problem with request:', e.message);
  });

  return req;
}

var printGrid = function(grid){
  console.log('');
  for(var line of grid){
    console.log(line);
  }
  console.log('');
}

var handleMoveQuery = function(body){
  printGrid(body['grid']);
  makeMove(body['name'], body['icon'], body['token']);
}

var handleJoinSuccess = function(body){
  pingServer(body['name'], body['id'])
  var str = 'Game joined successfully'+'\n'+'Waiting for turn';
  printClean(str);
  sendNotifyMeRequest(body['token']);
}
var handleMoveSuccess = function(body){
  printGrid(body['grid']);
  var str = 'Waiting for opponent to make turn';
  printClean(str);
  sendNotifyMeRequest(body['token']);
}

var handleMoveFailure = function(body){
  var str = 'I\'m sorry the move you made isn\'t valid';
  str+='\n'+'Please enter a column number between 0-8:';
  console.log(str);
  makeMove(body['name'], body['icon'], body['token']);
}

var handleGameOver = function(body){
  printGrid(body['grid']);
  var gameOverStr = 'GAME OVER: You are the ' +body['result'];
  if(body['reason'] != null){
    gameOverStr += ' because: ' + '\n' +body['reason'];
  }
  printClean(gameOverStr);
  process.exit()
}

var sendRequest = function(req, data){
  req.write(data);
  req.end();
}

var sendNotifyMeRequest = function(clientToken){
  sendRequest(createRequest(), JSON.stringify({
    type: 'notifyMe',
    token: clientToken
  }));
}

var makeMove = function(name, icon, token){
  var str = name+ ', it is your turn!'+'\n'+'Your icon is: '+icon;
  printClean(str);
  console.log('Enter a number between 0-8 to take turn:');
  var moveInputReq = createRequest()
  askForStdInput('move', moveInputReq, token);
}

var pingServer = function(playerName, playerId){
  const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
  const sendPing = async (playerName, playerId) => {
    while(true){
      sendRequest(createRequest(), JSON.stringify({
        type: 'ping',
        name: playerName,
        id: playerId
      }));
      await snooze(5000);
    }
  };
  sendPing(playerName, playerId);
}

var askForStdInput = function(typeOfInput, req, clientToken = null){
  stdin.resume();
  stdin.setEncoding('utf8');
  stdin.once('data', function(d){
    d = d.trim();
    var postData = JSON.stringify({
      data: d,
      type: typeOfInput,
      token: clientToken
    });
    sendRequest(req, postData);
  }
  );
}

var printClean = function(str){
  console.log('*********************************');
  console.log(str);
  console.log('*********************************');
}

var join = function(){
  var str = 'This is 5-in-a-Row.'+'\n'+'You must get 5 of your pieces in a row to win!';
  printClean(str);
  console.log('Please Enter your Name >');
  var req = createRequest();
  askForStdInput('join', req);
}

if (require.main === module) {
  join();
}

module.exports = {
  createRequest : createRequest,
  printGrid: printGrid,
  handleMoveQuery: handleMoveQuery,
  handleJoinSuccess :handleJoinSuccess,
  handleMoveFailure : handleMoveFailure,
  handleGameOver : handleGameOver,
  sendRequest : sendRequest,
  sendNotifyMeRequest : sendNotifyMeRequest,
  makeMove : makeMove,
  pingServer : pingServer,
  askForStdInput : askForStdInput,
  join : join
};

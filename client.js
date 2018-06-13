var http = require('http');
var querystring = require('querystring');
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
      // console.log(body)
      body = JSON.parse(body);
      var type = body['type'];
      if(type == 'message'){
        console.log(body['msg'])
      }else if(type == 'moveQuery'){
        for(var line of body['grid']){
          console.log(line);
        }
        makeMove(body['name'], body['icon'], body['token']);
      } else if(type == 'joinSuccess'){
        pingServer(body['name'], body['id'])
        console.log('')
        console.log('Game joined succesfully');
        console.log('Waiting for Turn');
        console.log('')
        sendNotifyMeRequest(body['token']);
      } else if(type == 'moveSuccess'){
        console.log('')
        for(var line of body['grid']){
          console.log(line);
        }
        console.log('')
        sendNotifyMeRequest(body['token']);
      } else if(type == 'moveFailure'){
        console.log('')
        console.log('I\'m sorry the move you made isn\'t valid');
        console.log('Please Enter a column between 0-8:');
        console.log('')
        makeMove(body['name'], body['icon'], body['token']);
      } else if(type == 'gameOver'){
        var gameOverStr = 'GAME OVER: You are the ' +body['result'];
        if(body['reason'] != null){
          gameOverStr += ' because: ' + body['reason'];
        }
        console.log(gameOverStr);
        process.exit()
      }
    });
  });

  req.on('error', function(e){
    console.log('Problem with request:', e.message);
  });

  return req;
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
  console.log('')
  console.log(name+ ', it is your turn!');
  console.log('Your icon is: ', icon);
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

var join = function(){
  console.log('Please Enter your Name >');
  var req = createRequest();
  askForStdInput('join', req);
}

join()

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
      }else if(type == 'grid'){
        for(var line of body['grid']){
          console.log(line);
        }
        askForMove()
      }
    });
  });

  req.on('error', function(e){
    console.log('Problem with request:', e.message);
  });

  return req;
}

var askForMove = function(){
  console.log('Enter a number between 0-8 to take turn:');
  var req = createRequest()
  askForStdInput('move', req);
}

var askForStdInput = function(typeOfInput, req){
  stdin.resume();
  stdin.setEncoding('utf8');
  stdin.once('data', function(d){
    d = d.trim();
    var postData = JSON.stringify({
      data: d,
      type: typeOfInput
    });
    var parsed = JSON.parse(postData)
    req.write(postData);
    req.end();
  }
  );
}

var join = function(){
  console.log('Please Enter your Name >');
  var req = createRequest();
  askForStdInput('join', req)
}

join()

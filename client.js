var http = require('http');
var querystring = require('querystring');
var options = {
  hostname : 'localhost',
  port: 3000,
  method: 'POST',
  headers: {
        "Content-Type": "application/json",
    }
};

// var body = JSON.stringify({
//     foo: "bar",
//     type: "move"
// })
var req = http.request(options, function(res){
  res.setEncoding('utf8');
  var body = ''
  res.on('data', function(data){
    body = data;
  });

  res.on('end', function(){
    body = JSON.parse(body);
    if(body['type'] == 'message'){
      console.log(body['msg'])
    }
  });
});

req.on('error', function(e){
  console.log('Problem with request:', e.message);
});

var stdin = process.stdin, stdout = process.stdout

var join = function(){
  console.log('Please Enter your Name >');
  // // resume initializes the stdin
  stdin.resume();
  stdin.setEncoding('utf8');
  stdin.once('data', function(data){
    var postData = JSON.stringify({
      name: data,
      type: 'join'
    });
    var parsed = JSON.parse(postData)
    req.write(postData);
    req.end();
  }
  );
}

join()

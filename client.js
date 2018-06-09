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

var body = JSON.stringify({
    foo: "bar",
    type: "move"
})
var req = http.request(options, function(res){
  res.setEncoding('utf8');

  res.on('data', function(chunk){
    console.log('BODY:', chunk);
  });

  res.on('end', function(){
    console.log('No more data in response.');
  });
});

req.on('error', function(e){
  console.log('Problem with request:', e.message);
});


// var request = new http.ClientRequest(options)
// console.log(body)
// request.end(body)
var stdin = process.stdin, stdout = process.stdout

var getName = function(){
  console.log('please enter your name >');
  // // resume initializes the stdin
  stdin.resume();
  stdin.setEncoding('utf8');
  stdin.once('data', function(data){
    var postData = JSON.stringify({
      name: data,
      type: 'name'
    });
    var parsed = JSON.parse(postData)
    req.write(postData);
    req.end();
  }
  );
}

getName()

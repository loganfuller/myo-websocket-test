var express = require('express'),
	bodyParser = require('body-parser');

var app = express();

// var comments = [{author: 'Pete Hunt', text: 'Hey there!'}];

app.use('/', express.static(__dirname + "/public"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

// app.get('/comments.json', function(req, res) {
//   	res.setHeader('Content-Type', 'application/json');
//   	res.send(JSON.stringify(comments));
// });

// app.post('/comments.json', function(req, res) {
//   	comments.push(req.body);
//   	res.setHeader('Content-Type', 'application/json');
//   	res.send(JSON.stringify(comments));
// });

app.listen(8000);

console.log('Server started: http://localhost:8000/');
var express = require('express'),
	bodyParser = require('body-parser');

var app = express();

app.use('/', express.static(__dirname + "/public"));

app.listen(8000, function() {
    console.log('Server started: http://localhost:8000/');
});


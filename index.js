const express = require('express');
var path = require('path');
const app = new express();
const open = require('open');

console.log(__dirname);

app.use('/files', express.static(__dirname+'/assets'));

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname+'\\src\\webC\\index.html'));
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

//open('http://localhost:3000', {app: 'chrome'});

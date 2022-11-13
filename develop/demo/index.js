var express = require('express');
var bodyParser = require('body-parser');
var op = require('./data/postdao');
var postClass = require('./data/post');
var app = express();
var port = 8081;
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', function (req, res) {
    res.send('Hello World');
});
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("应用成功启动");
});
app.post('/save', function (req, res) {
    var postBody = req.body;
    op.postToProcess = new postClass(postBody.userid, postBody.content);
    op.save();
    res.send('保存成功');
});

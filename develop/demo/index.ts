import {operate} from "./data/postdao";
import {posting} from "./data/posting";
import {deletePost, queryPostByUserId, savePosting, updatePost} from "./managers/PostingManager";

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8081;


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


app.get('/', function (req, res) {
    res.send('Hello World');
})


var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("应用成功启动")
})

app.get('/find',async function (req, res){
    let userid:number = Number(req.query.userid);  //必须手动转为字符串
    let commonRes = await queryPostByUserId(userid);
    res.send(commonRes)
})


app.get('/delete',function (req, res){
    let postid:number = Number(req.query.postid);
    let commonRes1 = deletePost(postid);
    res.send(commonRes1)
})

app.post('/save', function (req, res) {

    let postBody: posting = req.body;
    // const post = new posting();
    // Object.assign(post, req.body);

    // const res1 = await op.operate.get(postBody)
    let commonRes2 = savePosting(postBody);

    // operate.get(postBody).then(res1 => res.send(res1))
    res.send(commonRes2);
})


app.post('/reset',function (req, res){
    let postBody: posting = req.body;
    let commonRes3 = updatePost(postBody);
    res.send(commonRes3)
})
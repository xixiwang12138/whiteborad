const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/demo';

let post = {
    "userid": '',
    "content": ''
}

const operate = {
    function save(){}

}

//插入一条帖子
MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log('数据库已创建');
    let dbase = db.db("demo");
    dbase.collection('post').insertOne(post)
});


export default post
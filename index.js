const express = require('express');
const fetch = require('node-fetch');
var bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true })); 
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));

var info = ["false"];
var message = false;

const uri = 'mongodb+srv://GitCommitShow:GitCommitShow@cluster0.sbmyg.gcp.mongodb.net/GitCommitShow?retryWrites=true&w=majority';

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(uri,{ useUnifiedTopology: true ,useNewUrlParser:true }, function(err, db) {
    if (err) throw err;
    console.log("MongoDB Connected");
});

var arrayLength = 2;

app.get('/login', (req,res) =>{
    if(info[0] == "true"){
        res.redirect('/video');
    }
    else{
        res.render( __dirname + '/login.html');
    }
});

app.post('/signin' , (req , res ) => {
    MongoClient.connect(uri, { useUnifiedTopology: true ,useNewUrlParser:true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("GitCommitShow");
        dbo.collection("session").findOne({ email :req.body.email }, function(err, result) {
            if (err){
                res.redirect('/login');
            }
            if( req.body.password === result.password){
                info.pop();
                info.push("true");
                res.redirect('/video');
            }
            else{
                res.redirect('/login'); 
            }
        });
    });
})

app.post('/logout',(req,res) =>{
    info.pop();
    message = false;
    res.redirect('login');
})
app.get('/video',(req,res)=>{
    if(info[0] == "true"){
        MongoClient.connect(uri,{ useUnifiedTopology: true ,useNewUrlParser:true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("GitCommitShow");
            dbo.collection("video").find({}).toArray(function(err, result) {
                if (err) throw err; 
                res.render(__dirname+'/index.html',{result ,message})
            });
        });
    }
    else{
        res.redirect('/login');
    }
})
app.get('/upvote/:_id', (req, res) => {
    const id  = parseInt(req.params._id);
    MongoClient.connect(uri,{ useUnifiedTopology: true ,useNewUrlParser:true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("GitCommitShow");
        dbo.collection("video").find({ _id : id}).toArray( function(err, result){
            if (err) throw err;
            if(result[0].claps === 0){
                dbo.collection("video").updateOne( { _id: id } ,{ $set : {  claps : 1 }}, function(err) {
                    if (err) throw err;
                    console.log("Updated");
                    res.redirect('/video');
                });
            }
            else if(result[0].claps === 1){
                message = true;
                res.redirect('/video');
            }
        });
    });  
});

app.post('/new', (req,res) =>{
    res.render( __dirname+'/new.html');
})

app.post('/submit' , (req,res) => {
    arrayLength++;  
    var data = {
        "_id":arrayLength,"title":req.body.title,"tags":[req.body.tags],"url":req.body.url,"category":req.body.category,
        "speaker":{"name":req.body.sname,"Title":req.body.stitle,"Location":req.body.slocation},"claps":0
    }
    MongoClient.connect(uri,{ useUnifiedTopology: true ,useNewUrlParser:true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("GitCommitShow");
        dbo.collection("video").insertOne( data , function(err, res) {
            if (err) throw err;
            console.log("Inserted");
        });
    });
    res.redirect('/video');
})
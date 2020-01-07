var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var data = require('./data')
var userController = require('./controllers/users')
var postController = require('./controllers/posts')
var upload = multer()

app.use(express.static('public'));
app.use(cors())
app.use(bodyParser.json())

app.get('/posts', postController.posts);
app.get('/allposts', postController.allPosts);
app.post('/addPost',upload.single('file'),postController.addPost);

app.post('/login', userController.login );

app.listen( 5000 , ()=> {
    console.log("La API esta corriendo en el puerto 5000")
} )

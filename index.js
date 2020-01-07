var express = require('express');
var cors = require('cors');
var app = express();
var data = require('./data')


app.use(cors())

app.get('/posts', function(req, res) {
  res.send(data.posts);
});

app.listen( 5000 , ()=> {
    console.log("La API esta corriendo en el puerto 5000")
} )

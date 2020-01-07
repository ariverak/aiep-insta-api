const data = require('../data')
var jwt = require('jwt-simple');
var config = require('../config');

exports.login = function(req, res) {

    const username = req.body.username;
    const password = req.body.password;

    let userIndex = Object.values(data.users).findIndex(user=>user.username === username && user.password === password)

    const user = Object.values(data.users)[userIndex];
    const userId = Object.keys(data.users)[userIndex];

    user['id'] = userId;

    if(!user) return res.status(404).send("El usuario no existe")
    
    var token = jwt.encode(user, config.secret);

    res.send(token);
}
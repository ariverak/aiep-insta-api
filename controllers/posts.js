const data = require('../data')
const fs = require('fs');
const jwt = require('jwt-simple');
const moment = require('moment');
const stream = require('stream');
const config = require('../config');
const _ = require('lodash')

exports.posts = function(req, res) {
    
    const authorization = req.headers.authorization;

    
    if(!authorization) return res.status(403).send("No autorizado")
    
    let token = "";
    try {
        token = jwt.decode(authorization,config.secret)
    }catch(err){}
    
    if(!token) return res.status(403).send("No autorizado");

    var files = fs.readdirSync('public/images/posts/'+token.id);
    
    res.send(_.orderBy(files.map(f=>{
        let date = f.replace('.png','').replace('.jpg','').split('_')[0]
        let hour = f.replace('.png','').replace('.jpg','').split('_')[1]
        return ({ 
            user : data.users[token.id].username , 
            post : `${config.host}/images/posts/${token.id}/${f}`,
            created_at : `${date} ${hour.replace('-',':').replace('-',':')}`
        })
    }),'created_at','desc'));
}

exports.allPosts = function(req, res) {
    
    const authorization = req.headers.authorization;

    if(!authorization) return res.status(403).send("No autorizado")
    
    let token = "";
    try {
        token = jwt.decode(authorization,config.secret)
    }catch(err){}
    
    if(!token) return res.status(403).send("No autorizado");

    let allFiles = [];
    
    var allFolders = fs.readdirSync('public/images/posts/');

    allFolders.forEach(folder=>{
        var files = fs.readdirSync('public/images/posts/'+folder);
        allFiles.push(
            ...files.map(f=>{

                let date = f.replace('.png','').replace('.jpg','').split('_')[0]
                let hour = f.replace('.png','').replace('.jpg','').split('_')[1]

                return ({ 
                    user : data.users[folder].username , 
                    post : `${config.host}/images/posts/${token.id}/${f}`,
                    created_at : `${date} ${hour.replace('-',':').replace('-',':')}`
                })
        }));
    })
    
    res.send(_.orderBy(allFiles,'created_at','desc'));
}

exports.addPost = async function(req, res) {
    
    const authorization = req.headers.authorization;

    if(!authorization) return res.status(403).send("No autorizado")
    
    
    let token = "";
    try {
        token = jwt.decode(authorization,config.secret)
    }catch(err){}
    
    if(!token) return res.status(403).send("No autorizado");

    const file = req.file;

    const stream = bufferToStream(file.buffer)

    await storeImage({
        stream,
        path : "./public/images/posts/"+ token.id,
        filename : moment().format('YYYY-MM-DD[_]HH-mm-ss')
    })
    
    res.send(`Imagen Subida exitosamente`);
}


const storeImage = async ({ stream, path, filename }) => {
    const ext = '.jpg';
    const saveIn = `./${path}/${filename}${ext}`
    await new Promise((resolve, reject) =>
      stream
        .on('error', error => {
          if (stream.truncated)
            // Delete the truncated file.
            fs.unlinkSync(saveIn)
          reject(error)
        })
        .pipe(fs.createWriteStream(saveIn))
        .on('error', error => reject(error))
        .on('finish', () => resolve())
    )
    return new Promise((resolve, reject) =>
        Jimp.read(saveIn, (err, lenna) => {
            if (err) reject(err);
            lenna
            .resize(500, 500) 
            .quality(80) 
            .write(saveIn); // save
            resolve({ filename : filename+ext, path : saveIn })
        })
    )
  }

  function bufferToStream(buffer) {
    const duplexStream = new stream.Duplex();
    duplexStream.push(buffer);
    duplexStream.push(null);
    return duplexStream;
  }
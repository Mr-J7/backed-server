var express = require('express');

var fs = require('fs');

var app = express();

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;


    var path = `C:/Users/Juan.DESKTOP-8EMF56O/Desktop/Angular adv/backend-server/uploads/${tipo}/${img}`;


    fs.open(path, (err) => {
        if (err) {
            res.sendFile('C:/Users/Juan.DESKTOP-8EMF56O/Desktop/Angular adv/backend-server/assets/no-img.jpg');
        } else {
            res.sendFile(path);
        }
    });

});


module.exports = app;
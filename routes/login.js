var express = require('express');

var bcrypt = require('bcryptjs');

var Usuario = require('../models/usuario');

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID;
var CLIENT_SECRET = require('../config/config').CLIENT_SECRET;

// =====================================================================
// AUTENTICACION DE GOOGLE
// =====================================================================
app.post('/google', (req, res) => {

    var token = req.body.token;

    var client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, '');


    async function verify() {
        var ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];

        Usuario.findOne({ email: payload.email }, (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario - login',
                    errors: err
                });
            }
            if (usuario) {
                if (usuario.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe de usar su autenticacion normal',
                        errors: err
                    });
                } else {
                    usuario.password = '=)';
                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });

                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token,
                        id: usuario._id,
                    });
                }
                // Si el usuario no existe por correo
            } else {

                var usuario = new Usuario();

                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = '=)';
                usuario.img = payload.picture;
                usuario.google = true;

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear usuario - google',
                            errors: err
                        });
                    }

                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token,
                        id: usuarioDB._id,
                    });

                });

            }


        });





    }
    verify().catch(console.error, );






});



// =====================================================================
//  AUTENTICACION DE USUARIO NORMAL (GENERACION DE TOKEN CON JWT)
// =====================================================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        };

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        };

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        };

        // Crear un token con JWT
        usuarioDB.password = '=)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token,
            id: usuarioDB._id,
        });
    });


});









module.exports = app;
var express = require('express');

var jwt = require('jsonwebtoken');

var midAutenticacion = require('../middlewares/auntenticacion');

var Usuario = require('../models/usuario');

var bcrypt = require('bcryptjs');

var app = express();


// =====================================================================
//  GET USUARIO - OBTENER TODOS LOS USUARIOS
// =====================================================================

app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(

            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios
                });

            });
});





// =====================================================================
//  PUT USUARIO - ACTUALIZAR UN USUARIO NUEVO 
// =====================================================================
app.put('/:id', midAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id: ' + id + ' no existe',
                    errors: { message: 'No existe un usuario con ese ID' }
                });
            }
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;


        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });



    });

});



// =====================================================================
//  POST USUARIO - CREA UN NUEVO USUARIO 
// =====================================================================


app.post('/', midAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuarioToken: req.usuario,
            usuario: usuarioGuardado
        });

    });


});


// =====================================================================
// DETELE USUARIO - BORRA USUARIO
// =====================================================================
app.delete('/:id', midAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe ningun un usuario con ese id',
                errors: { message: 'No existe ningun un usuario con ese id' }
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});



module.exports = app;
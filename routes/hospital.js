var express = require('express');

var Hospital = require('../models/hospital');


var midAutenticacion = require('../middlewares/auntenticacion');


var app = express();


// =====================================================================
//  GET - OBTENER TODOS LOS HOSPITALES
// =====================================================================
app.get('/', (req, res, next) => {


    Hospital.find((err, hospitales) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: err,
            });
        }

        res.status(200).json({
            ok: true,
            hospitales,

        });

    });
});

// =====================================================================
// POST - CREAR UN NUEVO HOSPITAL
// =====================================================================
app.post('/', midAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospitales = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario
    });

    hospitales.save((err, hospitalesGuardados) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuarioToken: req.usuario,
            hospitalesGuardados,

        });

    });

});




// =====================================================================
// PUT - ACTUALIZA UN HOSPITAL
// =====================================================================
app.put('/:id', midAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var id = req.params.id;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id:' + id + 'no existe',
                errors: { message: 'No esiste el hospital con ese id' }
            });
        }

        hospital.nombre = body.nombre,
            hospital.img = body.img,
            hospital.usuario = body.usuario;


        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err,
                });
            }

            res.status(200).json({
                ok: true,
                hospitalGuardado,
            });

        });

    });

});




// =====================================================================
// DELETE - BORRAR HOSPITAL
// =====================================================================
app.delete('/:id', midAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe ningun medico con ese id',
                errors: { message: 'No existe ningun medico con ese id' }
            });
        }


        res.status(201).json({
            ok: true,
            hospitalBorrado
        });

    });
});



module.exports = app;
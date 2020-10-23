const { model } = require("mongoose");

var express = require('express');

var Medico = require('../models/medico');

var mdAutenticacion = require('../middlewares/auntenticacion');



var app = express();


// =====================================================================
// GET - OBTENER MEDICOS
// =====================================================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find((err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener medicos',
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });
            });

        }).populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5);

});



// =====================================================================
// POST - CREAR UN MEDICO
// =====================================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medicos = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medicos.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medicoGuardado
        })
    });

});



// =====================================================================
// PUT - ACTUALIZAR UN MEDICO
// =====================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                mensaje: 'El medico con el id: ' + id + 'no existe',
                errors: err
            });
        }


        medico.nombre = body.nombre,
            medico.usuario = req.usuario._id,
            medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medicoGuardado
            });
        });

    });
});


// =====================================================================
// DELETE - BORRAR MEDICO
// =====================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(201).json({
                ok: true,
                mensaje: 'No existe ningun medico con ese id',
                errors: { message: 'No existe ningun medico con ese id' }
            });
        }

        res.status(201).json({
            ok: true,
            medicoBorrado
        });
    });
});




module.exports = app;
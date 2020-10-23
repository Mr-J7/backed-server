var express = require('express');
const { populate } = require('../models/hospital');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =====================================================================
// BUSQUEDA POR COLECCION
// =====================================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var busquedaRegex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, busquedaRegex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, busquedaRegex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, busquedaRegex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, hospitales y medicos',
                error: { message: 'Tipo de tabla/coleccion no valido' }

            });
    }

    promesa.then(resp => {
        res.status(200).json({
            ok: true,
            [tabla]: resp
        });
    });

    // Promise.all([buscarUsuarios(busqueda, busquedaRegex), buscarMedicos(busqueda, busquedaRegex), buscarHospitales(busqueda, busquedaRegex)])
    //     .then(resp => {

    //         if (tabla === 'usuario' || tabla === 'usuarios') {
    //             res.status(200).json({
    //                 ok: true,
    //                 mensaje: 'Peticion realizada correctamente',
    //                 usuarios: resp[0]
    //             });
    //         }
    //         if (tabla === 'medico' || tabla === 'medicos') {
    //             res.status(200).json({
    //                 ok: true,
    //                 mensaje: 'Peticion realizada correctamente',
    //                 hospitales: resp[1]
    //             });
    //         }
    //         if (tabla === 'hospital' || tabla === 'hospitales') {
    //             res.status(200).json({
    //                 ok: true,
    //                 mensaje: 'Peticion realizada correctamente',
    //                 hospitales: resp[2]
    //             });
    //         }



    //     });

});







// =====================================================================
// BUSQUEDA GENERAL
// =====================================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex), buscarMedicos(busqueda, regex), buscarUsuarios(busqueda, regex)])
        .then(resp => {

            res.status(200).json({
                ok: true,
                mensaje: 'Peticion realizada correctamente',
                hospitales: resp[0],
                medicos: resp[1],
                usuarios: resp[2]
            });

        })

});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec(
                (err, hospitales) => {
                    if (err) {
                        reject('Error al cargar hospitales', err);
                    } else {
                        resolve(hospitales);
                    }
                });

    });

}



function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec(
                (err, medicos) => {
                    if (err) {
                        reject('Error al cargar medicos', err);
                    } else {
                        resolve(medicos);
                    }
                });

    });

}



function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios ', err);
                } else {
                    resolve(usuarios);
                }

            });

    });

}


module.exports = app;
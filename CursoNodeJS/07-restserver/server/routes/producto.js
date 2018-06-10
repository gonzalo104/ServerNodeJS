const express = require('express');
const {verificarToken} = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');

//========================
// OBTENER TODOS LOS PRODUCTOS
//=======================
app.get('/producto', (req, res) => {
    //trea todos los productos
    //populate usuario y categoria
    //paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Producto.find({disponible: true})
            .skip(desde)
            .limit(5)
            .populate('usuario', 'nombre email')
            .populate('categoria','descripcion')
            .exec((err, productos) => {
                    if (err) {
                        return res.status(500).json({
                            ok:false,
                            err
                        });
                    }

                    res.json({
                        ok:true,
                        productos
                    });
            });
});

//========================
// OBTENER un producto por id
//=======================
app.get('/producto/:id',verificarToken, (req, res) => {    
    //populate usuario y categoria
    //paginado

    let id = req.params.id;
    Producto.findById(id)
            .populate('usuario', 'nombre email')
            .populate('categoria', 'nombre')
            .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok:false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }

            res.json({
                ok:true,
                producto: productoDB
            });
            

    });
  

});



//========================
//Buscar productos
//=======================
app.get('/producto/buscar/:termino', verificarToken ,(req,res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
            .populate('categoria','nombre')
            .exec((err, productos) => { 
                if (err) {
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                }

                res.json({
                    ok:true,
                    productos
                })
            })

});







//========================
//CREAR UN PRODUCTO
//=======================
app.post('/producto', verificarToken , (req, res) => {    
    //grabar usuario
    //grabar categoria

    let body = req.body;
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }

        res.status(201).json({
            ok:true,
            producto: productoDB
        });



    });


});


//========================
//ACTUALIZAR PRODUCTO
//=======================
app.put('/producto/:id',verificarToken, (req, res) => {    
    //grabar usuario
    //grabar categoria

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(500).json({
                    ok:false,
                    err: {
                        message: 'No existe el producto'
                    }
                });;
            }

            productoDB.nombre = body.nombre;
            productoDB.precioUni = body.precioUni;
            productoDB.categoria = body.categoria;
            productoDB.disponible = body.disponible;
            productoDB.descripcion = body.descripcion;

            productoDB.save((err,productoGuardado) => {
                    if (err) {
                        return res.status(500).json({
                            ok:false,
                            err
                        });
                    }

                    res.json({
                        ok:true,
                        producto: productoGuardado
                    });
            })

    });


});


//========================
//BORRAR PRODUCTO
//=======================
app.delete('/producto/:id', verificarToken, (req, res) => {    
    //disponible pase a false

    let id = req.params.id;
    Producto.findById(id, (err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok:false,
                    err:{
                        message: 'el producto no existe'
                    }
                });
            }

            productoDB.disponible = false;
            productoDB.save((err,productoDeleted) => {
                if (err) {
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    producto: productoDeleted,
                    message: 'producto borrrado'
                });

            });


    })

});








module.exports = app;
const express = require('express')
const pool = require('../../mysql-connector')

const routerMascotas = express.Router()

routerMascotas.get('/', function (req, res) {
    pool.query('Select * from mascotas', function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
})

module.exports = routerMascotas
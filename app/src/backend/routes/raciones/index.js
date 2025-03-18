const express = require('express')
const pool = require('../../mysql-connector')

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Para hashear passwords

//------ usuario ------

const routerUser = express.Router()

routerUser.get('/', function (req, res) {
    pool.query('Select ration_id, racion_peso_gr, racion_hora from raciones where mascota_id = relation_id', function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
})

//------ registrar usuarios ------

const routerUserReg = express.Router()

routerUserReg.use(bodyParser.urlencoded({ extended: true }));
routerUserReg.use(bodyParser.json());

routerUserReg.get('/creacion', (req, res) => {
    res.sendFile(__dirname + '/creacion.html'); 
  });


//------ export routers ------

module.exports = {routerUser, routerUserReg}
const express = require('express')
const pool = require('../../mysql-connector')

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Para hashear passwords

//------ usuario ------

const routerUser = express.Router()

routerUsers.get('/', function (req, res) {
    pool.query('Select * from usuarios where user = ?', function(err, result, fields) {
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

routerUserReg.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html'); 
  });


//------ export routers ------

module.exports = {routerUser, routerUserReg}
const express = require('express')
const pool = require('../../mysql-connector')

//------ usuarios ------
const routerUsers = express.Router()

routerUsers.get('/', function (req, res) {
    pool.query('Select * from usuarios', function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
})

module.exports = routerUsers

//------ usuario ------

/*const routerUser = express.Router()

routerUsers.get('/', function (req, res) {
    pool.query('Select * from usuarios where user = ?', function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
})

app.get('/ultimaMedicion/:id',function(req,res){
    const id = req.params.id;
    console.log("se hizo GET a la api de mediciones para el dispositivo ",id);
    console.log(req.params);
    pool.query('SELECT medicionId, fecha, valor, dispositivoId FROM Mediciones WHERE dispositivoId = ? ORDER BY fecha DESC, medicionId DESC LIMIT 1', [id], function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
});

module.exports = routerUsers */
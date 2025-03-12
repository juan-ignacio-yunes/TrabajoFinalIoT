const express = require('express')
const pool = require('../../mysql-connector')

//------ dispositivos ------

const routerDispositivos = express.Router()

routerDispositivos.get('/', function (req, res) {
    pool.query('Select * from dispositivos', function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
})

//------ dispositivo ------

const routerDispositivo = express.Router()

routerDispositivo.get('/:id',function(req,res){
    const id = req.params.id;
    console.log("se hizo GET a la api de dispositivos para el dispositivo ",id);
    console.log(req.params);
    pool.query('SELECT * FROM dispositivos WHERE device_id = ?', [id], function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
});


//----- exporto todos -----
module.exports = {
    routerDispositivos,
    routerDispositivo
}
//=======[ Settings, Imports & Data ]==========================================

var PORT = 3000;

const cors = require('cors');

var express = require('express');
var app = express();
var pool = require('./mysql-connector');
const jwt = require('jsonwebtoken')
const { routerDispositivos, routerDispositivo } = require('./routes/dispositivos')
const routerMascotas = require('./routes/mascotas')
const routerUsuarios = require('./routes/usuarios')

const YOUR_SECRET_KEY = 'mi llave'
var testUser = {username: 'test', password: '1234'}

const corsOptions = {
    origin: '*',
}

var myLogger = function (req, res, next) {
    console.log('LOGGED')
    next()
}

var authenticator = function (req, res, next) {
    let autHeader = (req.headers.authorization || '')
    if (autHeader.startsWith('Bearer ')) {
        token = autHeader.split(' ')[1]
    } else {
        res.status(401).send({ message: 'Se requiere un token de tipo Bearer' })
    }
    jwt.verify(token, YOUR_SECRET_KEY, function(err) {
      if(err) {
        res.status(403).send({ message: 'Token inválido' })
      }
    })
    next()
}

// to parse application/json
app.use(express.json());
// to serve static files
app.use(express.static('/home/node/app/static/'));
app.use(cors(corsOptions))
app.use(myLogger)

//=======[ Main module code ]==================================================

// var cb0 = function (req, res, next) {
//     // Hago saneamiento de la request
//     // y luego paso al siguiente callback
//     // si se cumple cierta condición
//     console.log('CB0')
//     next()
// }

// var cb1 = function (req, res, next) {
//     console.log('CB1')
//     next()
// }


var cb2 = function (req, res, next) {
    res.send({'mensaje': 'Hola DAM!'}).status(200)
}

// app.get('/', [cb0, cb1, cb2]);
app.get('/', cb2);

app.use('/dispositivos', routerDispositivos)
app.use('/dispositivos', routerDispositivo)
app.use('/mascotas', routerMascotas)
app.use('/usuarios', routerUsuarios)

app.post('/login', (req, res) => {
    if (req.body) {
        var userData = req.body

        if (testUser.username === userData.username && testUser.password === userData.password) {
            var token = jwt.sign(userData, YOUR_SECRET_KEY)
            res.status(200).send({
                signed_user: userData,
                token: token
            })
        } else {
            res.status(403).send({
                errorMessage: 'Auth required'
            })
        }
    } else {
        res.status(403).send({
            errorMessage: 'Se requiere un usuario y contraseña'
        })
    }
})

/* app.get('/dispositivos', function (req, res) {
    pool.query('Select * from dispositivos', function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
}) */

/* app.get('/mediciones/:id',function(req,res){
    const id = req.params.id;
    console.log("se hizo GET a la api de mediciones para el dispositivo ",id);
    console.log(req.params);
    pool.query('SELECT * FROM Mediciones WHERE dispositivoId = ?', [id], function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
}); */

/* app.get('/ultimaMedicion/:id',function(req,res){
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
 */

app.post('/mediciones/agregar', function (req, res) {
    const id = req.body.dispositivoId;
    console.log("se hizo POST a la api de mediciones para dispositivo ",id);
    const sqlQuery = 'INSERT INTO Mediciones (medicionId, fecha, valor, dispositivoId) VALUES (?, ?, ?,?)';
    const values = [req.body.medicionId,req.body.fecha, req.body.valor, req.body.dispositivoId];

    pool.query(sqlQuery, values, function (err, result, fields) {
        if (err) {
            console.error(err);
            res.status(400).send("Error al agregar medicion");
            return;
        }
        res.send(result);
    });
});


app.get('/log_riegos/:id',function(req,res){
    const id = req.params.id;
    console.log("se hizo GET a la api de logs para el dispositivo ",id);
    console.log(req.params);
    pool.query('SELECT * FROM Log_Riegos WHERE electrovalvulaId = ?', [id], function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
});

app.post('/log_riegos/agregar', function (req, res) {
    const id = req.body.electrovalvulaId;
    console.log("se hizo POST a la api de logs para el dispositivo ",id)
    const sqlQuery = 'INSERT INTO Log_Riegos (logRiegoId, apertura, fecha, electrovalvulaId) VALUES (?, ?, ?, ?)';
    const values = [req.body.logRiegoId,req.body.apertura, req.body.fecha, req.body.electrovalvulaId];

    pool.query(sqlQuery, values, function (err, result, fields) {
        if (err) {
            console.error(err);
            res.status(400).send("Error al agregar log");
            return;
        }
        res.send(result);
    });
});


app.get('/prueba', authenticator, function(req, res) {
    res.send({message: 'Está autenticado, accede a los datos'})
})

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

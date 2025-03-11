//=======[ Settings, Imports & Data ]==========================================

const PORT = 3000;

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./mysql-connector');

// Routers
const { routerDispositivos, routerDispositivo } = require('./routes/dispositivos');
const routerMascotas = require('./routes/mascotas');
const { routerUser, routerUserReg } = require('./routes/usuarios');
const routerMediciones = require('./routes/mediciones');
const { routerLogin, routerRegistro } = require('./routes/registro');

const YOUR_SECRET_KEY = 'mi llave';

// Configuración global de CORS
const corsOptions = {
    origin: '*',  // Permitir peticiones desde cualquier dominio
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization']  // Headers permitidos
};

const app = express();
app.use(cors(corsOptions));  // Habilita CORS antes de cualquier otro middleware
app.options('*', cors());    // Manejo de preflight requests

// Middleware para parsear JSON
app.use(express.json());

// Middleware de logging
const myLogger = function (req, res, next) {
    console.log('LOGGED');
    next();
};
app.use(myLogger);

// Middleware de autenticación
const authenticator = function (req, res, next) {
    let autHeader = req.headers.authorization || '';
    if (autHeader.startsWith('Bearer ')) {
        token = autHeader.split(' ')[1];
    } else {
        return res.status(401).send({ message: 'Se requiere un token de tipo Bearer' });
    }
    jwt.verify(token, YOUR_SECRET_KEY, function(err) {
        if (err) {
            return res.status(403).send({ message: 'Token inválido' });
        }
    });
    next();
};

//=======[ Main module code ]==================================================

// Definir rutas en orden lógico
app.use('/registro', routerRegistro);
app.use('/login', routerLogin);
app.use('/dispositivos', routerDispositivos);
app.use('/dispositivos', routerDispositivo);
app.use('/mascotas', routerMascotas);
app.use('/usuarios', routerUser);
app.use('/usuarios', routerUserReg);
app.use('/mediciones', routerMediciones);

// Ruta protegida de prueba
app.get('/prueba', authenticator, function(req, res) {
    res.send({ message: 'Está autenticado, accede a los datos' });
});

// Iniciar servidor
app.listen(PORT, function() {
    console.log(`NodeJS API running correctly on http://localhost:${PORT}`);
});
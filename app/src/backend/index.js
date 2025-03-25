//=======[ Settings, Imports & Data ]==========================================
const PORT = 3000;

//---- para los endopints -----
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./mysql-connector');
//---- para los websockes -----
const http = require("http");
const setupWebSocket = require("./websockets/websocket");


// Routers
const { routerDispositivos, routerDispositivo } = require('./routes/dispositivos');
const routerMascotas = require('./routes/mascotas');
const { routerUser, routerUserReg } = require('./routes/usuarios');
const routerMediciones = require('./routes/mediciones');
const { routerLogin, routerCreacion } = require('./routes/creacion');

const YOUR_SECRET_KEY = 'mi llave';

// Configuración global de CORS
const corsOptions = {
    origin: '*',  // Permitir peticiones desde cualquier dominio
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization']  // Headers permitidos
};

const app = express();
app.use(cors(corsOptions));  // Habilita CORS antes de cualquier otro middleware
app.options('*', cors(corsOptions));    // Manejo de preflight requests
const server = http.createServer(app); //necesario para que websockets esté en el mismo puerto

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

// levantar websockets
// Inicializa websockets utilizando el mismo servidor HTTP
const { io, deviceSockets } = setupWebSocket(server);
// Guardar en app locals para acceder desde rutas
app.locals.deviceSockets = deviceSockets;


// Definir rutas en orden lógico
app.use('/creacion', routerCreacion);
app.use('/login', routerLogin);
app.use('/dispositivos', routerDispositivos);
app.use('/dispositivos', routerDispositivo);
app.use('/mascotas', routerMascotas);
app.use('/usuarios', routerUser);
app.use('/usuarios', routerUserReg);
app.use('/mediciones', routerMediciones);
//app.use('/raciones', routerRaciones);

// Ruta protegida de prueba
app.get('/prueba', authenticator, function(req, res) {
    res.send({ message: 'Está autenticado, accede a los datos' });
    res.send('API funcionando correctamente');
});

app.get('/', (req, res) => {
    res.send('¡Servidor backend funcionando correctamente!');
});

// Iniciar servidor
/*app.listen(PORT, function() {
    console.log(`NodeJS API & Wbesocket running correctly on http://localhost:${PORT}`);
});
*/
server.listen(PORT, function() {
    console.log(`Servidor NodeJS API & Wbesocket running correctly on http://localhost:${PORT}`);
});
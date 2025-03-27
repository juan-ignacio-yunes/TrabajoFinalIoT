const express = require('express')
const pool = require('../../mysql-connector')
const bcrypt = require('bcrypt'); // Para hashear passwords
const validator = require('validator'); // Para validar emails
const jwt = require('jsonwebtoken'); // Para autenticación
//const bodyParser = require('body-parser');


// ----- login de usuarios ----- //

const routerLogin = express.Router();
const YOUR_SECRET_KEY = 'mi llave';
var testUser = { username: 'test', password: '1234' }

/* routerLogin.post('/', (req, res) => {
    if (req.body) {
        var userData = req.body;

        if (testUser.username === userData.username && testUser.password === userData.password) {
            var token = jwt.sign(userData, YOUR_SECRET_KEY);
            res.status(200).send({
                signed_user: userData,
                token: token
            });
        } else {
            res.status(403).send({
                errorMessage: 'Auth required'
            });
        }
    } else {
        res.status(403).send({
            errorMessage: 'Se requiere un usuario y contraseña'
        });
    }
}); */

routerLogin.post('/', (req, res) => {
    try {
        console.log("Solicitud recibida:", req.body);
        const { user_email, password } = req.body;

        // Validar campos
        if (!user_email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
        }

        // 1. Buscar el usuario en la base de datos
        const queryBuscaUsuario = 'SELECT user_id, user_email, contraseña FROM usuarios WHERE user_email = ?'
        pool.query(queryBuscaUsuario, [user_email], async (err, rows) => {
            if (err) {
                console.error("Error en la consulta a la base de datos:", err);
                return res.status(500).json({ error: 'Error interno en la base de datos' });
            }

            // Verificar que exista el usuario
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const user = rows[0];

            // 2. Comparar la contraseña que ingresa el usuario con el hash almacenado
            const match = await bcrypt.compare(password, user.contraseña);
            if (!match) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // 3. Generar el JWT con la información necesaria (user_id, por ejemplo)
            const payload = { user_id: user.user_id };
            const token = jwt.sign(payload, YOUR_SECRET_KEY, {
                expiresIn: '1h', // Ajusta la expiración a tu gusto
            });

            // 4. Enviar respuesta con token
            return res.status(200).json({
                message: 'Login exitoso',
                token: token,
                // Puedes enviar más datos si lo necesitas (por ejemplo, user_id, nombre, etc.)
                user: {
                    user_id: user.user_id,
                    user_email: user.user_email,
                },
            });
        }
        );
    } catch (error) {
        console.error("Error al procesar el login:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
//------ crear usuario ------

/*const routerUserReg = express.Router()

routerUserReg.use(bodyParser.urlencoded({ extended: true }));
routerUserReg.use(bodyParser.json());

routerUserReg.get('/creacion', (req, res) => {
    res.sendFile(__dirname + '/creacion.html'); 
  });
*/

const routerUser = express.Router();
const SALT_ROUNDS = 10; // Seguridad para el hash

routerUser.post('/', (req, res) => {
    console.log("Solicitud recibida:", req.body);
    try {
        const { user_email, password, user_nombre } = req.body;

        console.log("Datos recibidos:", user_email, password);

        // Validar campos obligatorios
        if (!user_email || !password) {
            return res.status(400).json({ error: 'El email y la contraseña son obligatorios' });
        }

        // Validar formato de email
        if (!validator.isEmail(user_email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }

        // Verificar si el email ya existe
        pool.query(
            'SELECT user_id FROM usuarios WHERE user_email = ?',
            [user_email],
            (err, rows) => {
                if (err) {
                    console.error("Error en la consulta SQL:", err);
                    return res.status(500).json({ error: 'Error en la base de datos' });
                }

                console.log("Resultado de búsqueda de email:", rows);

                if (rows.length > 0) {
                    return res.status(400).json({ error: 'El email ya está en uso' });
                }

                // Hashear la contraseña antes de insertarla
                bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
                    if (err) {
                        console.error("Error al hashear la contraseña:", err);
                        return res.status(500).json({ error: 'Error interno al procesar la contraseña' });
                    }

                    console.log("Contraseña hasheada:", hashedPassword);

                    // Insertar el usuario en la base de datos
                    pool.query(
                        'INSERT INTO usuarios (user_email, contraseña, user_nombre) VALUES (?, ?, ?)',
                        [user_email, hashedPassword, user_nombre || null],
                        (err, result) => {
                            if (err) {
                                console.error("Error al registrar el usuario:", err);
                                return res.status(500).json({ error: 'Error al registrar el usuario' });
                            }

                            console.log("Usuario insertado correctamente:", result);
                            res.status(201).json({ message: 'Usuario registrado exitosamente' });
                        }
                    );
                });
            }
        );
    } catch (error) {
        console.error("Error general al registrar el usuario:", error);
        return res.status(500).json({ error: 'Error inesperado al registrar el usuario' });
    }
});

//------ obtener usuario ------

routerUser.get('/', function (req, res) {
    pool.query('Select * from usuarios where user = ?', function (err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
});

//------ eliminar usuario ------

routerUser.delete('/', function (req, res) {
    pool.query('DELETE FROM usuarios WHERE user = ?', function (err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
});

//------ export routers ------

module.exports = { routerLogin, routerUser };
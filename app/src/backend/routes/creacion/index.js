const express = require('express');
const pool = require('../../mysql-connector');
const bcrypt = require('bcrypt'); // Para hashear passwords
const validator = require('validator'); // Para validar emails

// ----- login de usuarios ----- //

const routerLogin = express.Router();

routerLogin.post('/', (req, res) => {
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
});

// ----- creacion de usuarios ----- //

const routerCreacion = express.Router();
const SALT_ROUNDS = 10; // Seguridad para el hash

routerCreacion.post('/', (req, res) => {
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

module.exports = { routerLogin, routerCreacion };
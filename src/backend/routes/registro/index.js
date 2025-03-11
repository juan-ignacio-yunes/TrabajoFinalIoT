const express = require('express');
const pool = require('../../mysql-connector');
const bcrypt = require('bcrypt'); // Para hashear passwords
const validator = require('validator'); // Para validar emails

// ----- login de usuarios ----- //

const routerLogin = express.Router();

routerLogin.post('/login', (req, res) => {
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

// ----- registro de usuarios ----- //

const routerRegistro = express.Router();

const SALT_ROUNDS = 10; // Seguridad para el hash

routerRegistro.post('/registro', async (req, res) => {
    
    try {
        const { user_email, password, user_nombre } = req.body;

        // Validar campos obligatorios
        if (!user_email || !password ) {
            return res.status(400).json({ error: 'El email y la contraseña son obligatorios' });
        }

        // Validar formato de email
        if (!validator.isEmail(user_email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }

        // Verificar si el email ya existe
        const [rows] = await pool.promise().query(
            'SELECT user_id FROM usuarios WHERE user_email = ?',
            [user_email]
        );
        if (rows.length > 0) {
            return res.status(400).send('El email ya está en uso');
        }
    
        // Hashear la contraseña
        /*bcrypt.hash(password, 10 /*número de SALT_ROUNDS*//*, function(err, hash) {
            if (err) {
                console.error("Error al hashear la contraseña:", err);
                return res.status(500).json({ error: 'Error al registrar el usuario' });
            }

            const query = 'INSERT INTO usuarios (user_email, contraseña, user_nombre) VALUES (?, ?, ?)';
            pool.query(query, [user_email, hash, user_nombre], function (err, result) {
                if (err) {
                    console.error("Error al registrar el usuario:", err);
                    return res.status(500).json({ error: 'Error al registrar el usuario' });
                }
                res.json({ mensaje: 'Usuario registrado correctamente' });
            });
        });
    } */
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insertar el usuario en la base de datos
    await pool.promise().query(
        'INSERT INTO usuarios (user_email, contraseña, user_nombre) VALUES (?, ?, ?)',
        [user_email, hashedPassword, user_nombre || null]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        return res.status(500).json({ error: 'Error al registrar el usuario' });
    }
})

module.exports = {routerLogin, routerRegistro};
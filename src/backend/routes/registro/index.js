const express = require('express');
const pool = require('../../mysql-connector');
const bcrypt = require('bcrypt'); // Para hashear passwords

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

routerRegistro.post('/registro', async (req, res) => {
    
    try {
        const { user, password, email } = req.body;

        // Validar campos obligatorios
        if (!user_email || !password ) {
            return res.status(400).json({ error: 'El email y la contraseña son obligatorios' });
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
        bcrypt.hash(password, 10 /*número de SALT_ROUNDS*/, function(err, hash) {
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
    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        return res.status(500).json({ error: 'Error al registrar el usuario' });
    }
})

module.exports = {routerLogin, routerRegistro};
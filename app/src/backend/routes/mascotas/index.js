const express = require('express')
const pool = require('../../mysql-connector')

/* const routerMascotas = express.Router()

routerMascotas.get('/', function (req, res) {
    pool.query('Select * from mascotas', function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
})

module.exports = routerMascotas */

// GET /mascotas?user_id=XYZ
// Devuelve las mascotas relacionadas con el user_id indicado
const routerMascota= express.Router()

routerMascota.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id es requerido' });
    }
    
    // Consulta para obtener las mascotas del usuario
    // Usamos la tabla "relaciones" para vincular user_id -> pet_id
    const query = `
      SELECT m.*
      FROM mascotas m
      INNER JOIN relaciones r ON m.pet_id = r.pet_id
      WHERE r.user_id = ?
    `;
    const [rows] = await db.query(query, [user_id]);
    
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /mascotas
// Crea una nueva mascota y su relación correspondiente
routerMascota.post('/', async (req, res) => {
  try {
    const {
      pet_nombre,
      raza,
      alturaHombros_cm,
      peso_kg,
      fechaNacimiento,
      observaciones,
      pesoMin,
      pesoMax,
      user_id,
      device_id
    } = req.body;

    if (!user_id || !device_id) {
      return res.status(400).json({ error: 'user_id y device_id son requeridos' });
    }

    // 1. Insertar en tabla "mascotas"
    const limites = JSON.stringify({
      pesoMin: pesoMin || null,
      pesoMax: pesoMax || null
    });

    const insertMascotaQuery = `
      INSERT INTO mascotas (
        pet_nombre,
        raza,
        alturaHombros_cm,
        peso_kg,
        limites,
        fechaNacimiento,
        observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(insertMascotaQuery, [
      pet_nombre,
      raza,
      alturaHombros_cm,
      peso_kg,
      limites,
      fechaNacimiento,
      observaciones
    ]);

    const newPetId = result.insertId;

    // 2. Insertar la relación en la tabla "relaciones"
    const insertRelacionQuery = `
      INSERT INTO relaciones (user_id, device_id, pet_id)
      VALUES (?, ?, ?)
    `;
    await db.query(insertRelacionQuery, [user_id, device_id, newPetId]);

    return res.json({
      message: 'Mascota creada exitosamente',
      pet_id: newPetId
    });
  } catch (error) {
    console.error('Error al crear mascota:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /mascotas/:id
// Actualiza información de la mascota en la tabla "mascotas"
routerMascota.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pet_nombre,
      raza,
      alturaHombros_cm,
      peso_kg,
      fechaNacimiento,
      observaciones,
      pesoMin,
      pesoMax
    } = req.body;

    const limites = JSON.stringify({
      pesoMin: pesoMin || null,
      pesoMax: pesoMax || null
    });

    const updateQuery = `
      UPDATE mascotas
      SET
        pet_nombre = ?,
        raza = ?,
        alturaHombros_cm = ?,
        peso_kg = ?,
        limites = ?,
        fechaNacimiento = ?,
        observaciones = ?
      WHERE pet_id = ?
    `;
    await db.query(updateQuery, [
      pet_nombre,
      raza,
      alturaHombros_cm,
      peso_kg,
      limites,
      fechaNacimiento,
      observaciones,
      id
    ]);

    return res.json({ message: 'Mascota actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /mascotas/:id
// Elimina la mascota (y por ON DELETE CASCADE se eliminan mediciones, relaciones, etc.)
routerMascota.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleteQuery = `DELETE FROM mascotas WHERE pet_id = ?`;
    await db.query(deleteQuery, [id]);

    return res.json({ message: 'Mascota eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = routerMascota;

const pool = require('../mysql-connector');

async function crearRacion(req, res) {
  const { deviceId, horario, cantidad } = req.body;

  try {
    await pool.query(
      "INSERT INTO raciones (device_id, horario, cantidad) VALUES (?, ?, ?)",
      [deviceId, horario, cantidad]
    );

    const socket = req.app.locals.deviceSockets.get(deviceId);
    if (socket) {
      socket.emit("update_raciones");
      console.log(`📡 update_raciones enviado a ${deviceId}`);
    }

    return res.status(201).json({ message: "Ración creada" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al crear ración" });
  }
}

async function eliminarRacion(req, res) {
  const { racionId, deviceId } = req.body;

  try {
    await pool.query(
      "DELETE FROM raciones WHERE id = ? AND device_id = ?",
      [racionId, deviceId]
    );

    const socket = req.app.locals.deviceSockets.get(deviceId);
    if (socket) {
      socket.emit("update_raciones");
      console.log(`📡 update_raciones enviado a ${deviceId}`);
    }

    return res.status(200).json({ message: "Ración eliminada" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al eliminar ración" });
  }
}

module.exports = { crearRacion, eliminarRacion };

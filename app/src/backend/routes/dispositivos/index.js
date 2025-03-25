const express = require('express')
const pool = require('../../mysql-connector')

//------ obtengo todos los dispositivos ------

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

//------ Manejo de dispositivo en particular ------

const routerDispositivo = express.Router()

//GET /dispositivo/:id (obtener dispositivo por user_id. Uso user_id porque no siempre tengo el device_id. Ej.: cuando se registra un nuevo dispositivo)
routerDispositivo.get('/:id',function(req,res){
    const id = req.params.id;
    console.log("se hizo GET a la api de dispositivos para el dispositivo cuyo dueño tiene el id: ",id);
    console.log(req.params);
    const query = `
      SELECT d.*
      FROM dispositivos d 
      INNER JOIN relaciones r ON d.device_id = r.device_id
      WHERE r.user_id = ?
    `;
    pool.query(query, [id], function(err, result, fields) {
        if (err) {
            res.send(err).status(400);
            return;
        }
        res.send(result);
    });
});

// POST /desvincular (desvincular dispositivo de device_id. Acá ya uso device_id porque ya estoy seguro que existe)
routerDispositivo.post("/", function (req, res) {
    const { userId, deviceId } = req.body;
    try {
        // 1. Actualizar la tabla relaciones (poner device_id NULL para ese user)
        pool.query(
        "UPDATE relaciones SET device_id = NULL WHERE user_id = ? AND device_id = ?",
        [userId, deviceId]
        );

        // 2. Eliminar la estación de la tabla dispositivos
        pool.query("DELETE FROM dispositivos WHERE id = ?", [deviceId]);

        // 3. Emitir mensaje WebSocket al ESP32 si está conectado
        const socket = req.app.locals.deviceSockets.get(deviceId);
        if (socket) {
        socket.emit("desvincular");
        console.log(`🗑️ Estación ${deviceId} desvinculada`);
        } else {
        console.log(`⚠️ La estación ${deviceId} no está conectada por WebSocket`);
        }

        return res.status(200).json({ message: "Estación desvinculada correctamente" });
    } catch (err) {
        console.error("Error al desvincular estación:", err);
        return res.status(500).json({ message: "Error al desvincular la estación" });
    }
});

//----- exporto todos -----
module.exports = {
    routerDispositivos,
    routerDispositivo
}
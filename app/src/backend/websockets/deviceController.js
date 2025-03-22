// src/controllers/deviceController.js

function deleteDevice(req, res) {
    const { deviceId } = req.params;
  
    // Lógica para eliminar de DB...
  
    const socket = req.app.locals.deviceSockets.get(deviceId);
    if (socket) {
      socket.emit("desvincular", { deviceId });
    }
  
    return res.status(200).json({ message: "Dispositivo desvinculado" });
}

function racionCreada(req, res) {
    const { deviceId, amount, schedule } = req.body;
  
    // Guardar en DB...
  
    const socket = req.app.locals.deviceSockets.get(deviceId);
    if (socket) {
      socket.emit("update_raciones", { amount, schedule });
    }
  
    return res.status(201).json({ message: "actualizar raciones" });
}

function alimentar(req, res) {
    const { deviceId } = req.body;
  
    const socket = req.app.locals.deviceSockets.get(deviceId);
    if (socket) {
      socket.emit("alimentar");
    }
  
    return res.status(200).json({ message: "Orden de alimentar enviada" });
}  
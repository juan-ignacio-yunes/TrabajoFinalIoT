function alimentar(req, res) {
  const { deviceId } = req.body;

  const socket = req.app.locals.deviceSockets.get(deviceId);
  if (socket) {
    socket.emit("alimentar");
    console.log(`🚀 Orden de alimentar enviada a ${deviceId}`);
    return res.status(200).json({ message: "Orden enviada" });
  } else {
    return res.status(404).json({ message: "Estación no conectada" });
  }
}
  
module.exports = { alimentar };
  
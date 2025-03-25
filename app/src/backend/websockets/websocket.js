const { Server } = require("socket.io");

const deviceSockets = new Map(); // deviceId -> socket

function setupWebSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("🔌 Nuevo cliente WebSocket conectado");

    socket.on("register-device", (deviceId) => {
      console.log(`📲 Registrado ESP32 con ID ${deviceId}`);
      deviceSockets.set(deviceId, socket);
    });

    socket.on("disconnect", () => {
      for (const [deviceId, s] of deviceSockets.entries()) {
        if (s === socket) {
          deviceSockets.delete(deviceId);
          console.log(`❌ ESP32 desconectado: ${deviceId}`);
          break;
        }
      }
    });
  });

  return { io, deviceSockets };
}

module.exports = setupWebSocket;

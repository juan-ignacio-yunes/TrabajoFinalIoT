const { Server } = require("socket.io");

const deviceSockets = new Map(); // device_id -> socket

function setupWebSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }, // Ajustar si es necesario
  });

  io.on("connection", (socket) => {
    console.log("Cliente WebSocket conectado");

    socket.on("register-device", (device_id) => {
      console.log(`Registrado dispositivo ${device_id}`);
      deviceSockets.set(device_id, socket);
    });

    socket.on("disconnect", () => {
      // Eliminamos el socket de la lista si se desconecta
      for (const [device_id, sock] of deviceSockets.entries()) {
        if (sock === socket) {
          deviceSockets.delete(device_id);
          console.log(`Dispositivo ${device_id} desconectado`);
          break;
        }
      }
    });
  });

  return { io, deviceSockets };
}

module.exports = setupWebSocket;

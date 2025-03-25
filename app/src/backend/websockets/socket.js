const socketIo = require("socket.io");
const { handleDeviceEvents, deviceSockets } = require('./deviceController');

const deviceSockets = new Map(); // device_id -> socket

function setupWebSocket(server) {
  const io = socketIo(server, {
    cors: { origin: "*" }, // Ajustar si es necesario
  });

  io.on("connection", (socket) => {
    console.log("Cliente conectado al WebSocket");

    socket.on("register-device", (device_id) => {
      console.log(`Registrado dispositivo ${device_id}`);
      deviceSockets.set(device_id, socket);
    });

    // Delega a deviceController el manejo de los eventos específicos
    handleDeviceEvents(socket, deviceSockets);

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

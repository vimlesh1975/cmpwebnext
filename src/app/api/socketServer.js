const { Server } = require("socket.io");

// Initialize Socket.IO server
const options = { cors: true };
export default  socketServer = (server) => {
  const io = new Server(server, options);

  // Event handler for new connections
  io.on("connection", (socket) => {
    console.log("New client connected!");

    // Event handler for receiving messages
    socket.on("message", (data) => {
      console.log("Received message:", data);

      // Broadcast the message to all clients
      io.emit("message", data);
    });

    // Event handler for disconnections
    socket.on("disconnect", () => {
      console.log("Client disconnected!");
    });
  });
};

// module.exports = socketServer;

// Import the necessary modules
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create an Express app
const app = express();


// Define your custom server middleware logic
app.use((req, res, next) => {
  // Perform some custom server-side logic here
  console.log('Custom server middleware');

  // Call the next middleware or route handler
  next();
});

// Create a Next.js server instance
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// Prepare the Next.js application
nextApp.prepare().then(() => {
  // Attach the custom server middleware to the Next.js server
  // app.use('/_next/__webpack-hmr', createProxyMiddleware({ target: 'http://localhost:3000', ws: true }));

  app.get('*', (req, res) => nextHandler(req, res));
  app.post('*', (req, res) => nextHandler(req, res));

  // Create the Next.js server and listen on port 3000
  const server = createServer(app);
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Next.js server listening on port ${PORT}`);
  });

  // Create the Socket.IO server and listen on a separate port (4000)
  const ioServer = createServer();
  const io = new Server(ioServer, { cors: true });
  io.listen(4000);
  console.log('Socket.IO server listening on port 4000');

  // Handle Socket.IO events
  io.on('connection', (socket) => {
   // Forward the HMR WebSocket connection to the Next.js server
    if (socket.handshake.headers.referer.includes('/_next/webpack-hmr')) {
      socket.emit('forward', socket.handshake);
    }
    console.log("New WebSocket client connected");
    socket.emit('connectionStatus', 'true');
    socket.on("disconnect", () => {
      console.log("WebSocket client disconnected");
    });
  });
 
  // Additional code for OSC handling
  var osc = require('osc');
  var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 6250,
    metadata: true
  });
  udpPort.open();

  udpPort.on("message", function (oscMessage, info) {
    if (oscMessage.address === '/channel/1/stage/layer/1/file/time') {
      io.emit("FromAPI", sectohmsm(parseFloat(oscMessage.args[1].value - oscMessage.args[0].value).toFixed(2)));
    } else if (oscMessage.address === '/channel/1/stage/layer/1/foreground/file/time') {
      io.emit("FromAPI", sectohmsm(parseFloat(oscMessage.args[1].value - oscMessage.args[0].value).toFixed(2)));
    }
  });
});

const sectohmsm = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);
  const hmsms = `${hours}:${minutes}:${seconds}.${milliseconds}`;
  return hmsms; // Output: "0:20:34.560"
};


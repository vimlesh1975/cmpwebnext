// server.js

// Import the necessary modules
const express = require('express');
const { createServer } = require('http');

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
  app.get('*', (req, res) => nextHandler(req, res));
  app.post('*', (req, res) => nextHandler(req, res));

  // Create the server and listen on the specified port
  const server = createServer(app);

  const io = require("socket.io")(server, { cors: true });
  io.on('connection', (socket) => {
    console.log("New Web Socket client connected");
    socket.emit('connectionStatus', 'true')
    socket.on("disconnect", () => {
      console.log("client disconnected")
    })
  })

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('Server listening on port 3000');
  });
  
//osc code
var osc = require('osc')
var udpPort = new osc.UDPPort({
  localAddress: "127.0.0.1",
  localPort: 6250,
  metadata: true
});
udpPort.open();

udpPort.on("message", function (oscMessage, info) {

  if (oscMessage.address === '/channel/1/stage/layer/1/file/time') {
    // ccgsocket.emit('Fromccgsocket', oscMessage.args[0].value);
    // io.emit("FromAPI",oscMessage.address + oscMessage.args[0].value);
    io.emit("FromAPI", sectohmsm( parseFloat(oscMessage.args[1].value-oscMessage.args[0].value).toFixed(2)));
  }
  else if (oscMessage.address === '/channel/1/stage/layer/1/foreground/file/time') {
    // ccgsocket.emit('Fromccgsocket', oscMessage.args[0].value);
    io.emit("FromAPI", sectohmsm( parseFloat(oscMessage.args[1].value-oscMessage.args[0].value).toFixed(2)));
  }
});
//ocs code

});

const sectohmsm=(totalSeconds)=>{
const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
const seconds = Math.floor(totalSeconds % 60);
const milliseconds = Math.floor((totalSeconds % 1) * 1000);
const hmsms = `${hours}:${minutes}:${seconds}.${milliseconds}`;
return(hmsms); // Output: "0:20:34.560"
}
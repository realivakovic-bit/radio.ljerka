const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let listeners = 0;

app.use(express.static("public"));

wss.on("connection", (ws) => {

  ws.on("message", (msg) => {

    if (msg.toString() === "play") {
      listeners++;
      console.log("Listeners:", listeners);
    }

    if (msg.toString() === "stop") {
      listeners--;
      console.log("Listeners:", listeners);
    }

  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

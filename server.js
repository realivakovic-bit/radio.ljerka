const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));
app.get("/count", (req, res) => {
  res.json({ listeners: listeners });
});

let listeners = 0;

function broadcastCount() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "count",
        listeners: listeners
      }));
    }
  });
}

wss.on("connection", (ws) => {

  let listening = false;

  ws.on("message", (msg) => {

    if (msg.toString() === "play" && !listening) {
      listening = true;
      listeners++;
      broadcastCount();
    }

    if (msg.toString() === "stop" && listening) {
      listening = false;
      listeners--;
      broadcastCount();
    }

  });

  ws.on("close", () => {

    if (listening) {
      listeners--;
      broadcastCount();
    }

  });

  broadcastCount();

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

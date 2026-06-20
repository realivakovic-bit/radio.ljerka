const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));
app.use(express.json());

let listeners = 0;
let degradation = 0;

function broadcast(data) {
  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastCount() {
  broadcast({
    type: "count",
    listeners: listeners
  });
}

function broadcastDegradation() {
  broadcast({
    type: "degradation",
    value: degradation
  });
}

app.get("/count", (req, res) => {
  res.json({ listeners: listeners });
});

app.post("/degradation", (req, res) => {
  degradation = Number(req.body.value) || 0;
  console.log("Degradation:", degradation);
  broadcastDegradation();
  res.json({ ok: true, degradation: degradation });
});

wss.on("connection", (ws) => {
  let listening = false;

  ws.send(JSON.stringify({
    type: "count",
    listeners: listeners
  }));

  ws.send(JSON.stringify({
    type: "degradation",
    value: degradation
  }));

  ws.on("message", (msg) => {
    const text = msg.toString();

    if (text === "play" && !listening) {
      listening = true;
      listeners++;
      broadcastCount();
    }

    if (text === "stop" && listening) {
      listening = false;
      listeners = Math.max(0, listeners - 1);
      broadcastCount();
    }
  });

  ws.on("close", () => {
    if (listening) {
      listeners = Math.max(0, listeners - 1);
      broadcastCount();
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

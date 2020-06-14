import WebSocket from "ws";

const server = new WebSocket.Server({
  port: 3000,
});
server.on("connection", function (socket, req) {
  socket.on("message", (data) => {
    console.log('message received:', data);
  });
  socket.send("connected");
});

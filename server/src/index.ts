import WebSocket from "ws";

const server = new WebSocket.Server({
  port: 3000,
});
const sockets: WebSocket[] = [];
server.on("connection", function (socket, req) {
  sockets.push(socket);
  socket.on("message", (data) => {
    try {
      const json = JSON.parse(data.toString());
      if (json.type === "draw" || json.type === "clear") {
        sockets.forEach((s) => s.send(data));
      }
    } catch (e) {}
  });
});

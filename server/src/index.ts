import WebSocket from "ws";
interface DrawedMessageData {
  event: "drawed";
  data: {
    x: number;
    y: number;
  };
}

const server = new WebSocket.Server({
  port: 3000,
});
const sockets: WebSocket[] = [];
server.on("connection", function (socket, req) {
  sockets.push(socket);
  socket.on("message", (data) => {
    try {
      const json = JSON.parse(data.toString());
      if (json.type && json.userId && json.point) {
        sockets.forEach((s) => s.send(data));
      }
    } catch (e) {}
  });
});

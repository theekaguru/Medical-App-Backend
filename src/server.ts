import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { setSocketIOInstance } from "./complaintReplies/socket";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

setSocketIOInstance(io); // <- make io accessible in other files

io.on("connection", (socket) => {
  const { complaintId } = socket.handshake.query;
  if (complaintId) {
    socket.join(`complaint-${complaintId}`);
  }

  socket.on("send-reply", (reply) => {
    console.log(`Broadcasting to complaint-${reply.complaintId}`, reply);
    io.to(`complaint-${reply.complaintId}`).emit("new-reply", reply);
  });
});


server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

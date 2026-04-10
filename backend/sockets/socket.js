const { Server } = require("socket.io");
const Message = require("../models/Message");

let io;

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", (matchId) => {
      socket.join(matchId);
      console.log("JOINED ROOM:", matchId, socket.id);
    });

    socket.on("leave_room", (matchId) => {
      socket.leave(matchId);
      console.log("LEFT ROOM:", matchId);
    });

    socket.on("send_message", async (data) => {
      try {
        const savedMessage = await Message.create({
          sender: data.senderId,
          content: data.content,
          matchId: data.matchId,
        });

        io.to(data.matchId).emit("receive_message", savedMessage);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

exports.getIO = () => io;
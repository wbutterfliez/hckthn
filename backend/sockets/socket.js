const { Server } = require("socket.io");
const Message = require("../models/Message");
const Match = require("../models/Match");

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
    });

    socket.on("leave_room", (matchId) => {
      socket.leave(matchId);
    });

    socket.on("send_message", async (data) => {
      try {
        const { senderId, matchId, content } = data;

        // 🔥 FIND MATCH TO GET RECEIVER
        const match = await Match.findById(matchId);

        if (!match) return;

        const receiverId = match.users.find(
          (id) => id.toString() !== senderId
        );

        // 🔥 SAVE MESSAGE (WITH RECEIVER)
        const savedMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content,
          matchId,
        });

        io.to(matchId).emit("receive_message", savedMessage);
      } catch (err) {
        console.error("SOCKET ERROR:", err);
      }
    });

    socket.on("match_status_updated", (data) => {
      io.to(data.matchId).emit("match_status_updated", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

exports.getIO = () => io;
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();

// 🔥 IMPORT SOCKET
const { initSocket } = require("./sockets/socket");

const app = express();

// ✅ CREATE SERVER (IMPORTANT)
const server = http.createServer(app);

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ ROUTES
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/match", require("./routes/matchRoutes"));

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("API running...");
});

// ✅ INIT SOCKET
initSocket(server);

// ✅ DB CONNECT
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // 🔥 USE SERVER NOT APP
    server.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));
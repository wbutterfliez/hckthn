const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initSocket } = require("./sockets/socket");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/match", require("./routes/matchRoutes"));

// socket
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
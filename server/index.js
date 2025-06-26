const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const tournamentRoutes = require("./routes/tournament");
const teamRoutes = require("./routes/team");
// Import matchRoutes as a function to pass 'io'
const createMatchRoutes = require("./routes/match");
const playerRoutes = require("./routes/player");
const path = require("path");

const app = express();
// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());
// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
// Initialize match routes with socket.io
app.use("/api/matches", createMatchRoutes(io));
app.use("/api/players", playerRoutes);

// Health-check
app.get("/", (req, res) => {
  res.send("Football API running");
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected", socket.id));
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));

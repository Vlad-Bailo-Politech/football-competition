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
const createMatchRoutes = require("./routes/match");
const playerRoutes = require("./routes/player");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", createMatchRoutes(io));
app.use("/api/players", playerRoutes);

app.get("/", (req, res) => {
  res.send("Football API running");
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected", socket.id));
});

module.exports = { app, server };

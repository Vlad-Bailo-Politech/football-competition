const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth"); //
const userRoutes = require("./routes/user"); //
const tournamentRoutes = require("./routes/tournament"); //
const teamRoutes = require("./routes/team"); //
const matchRoutes = require("./routes/match"); //
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes); //
app.use("/api/users", userRoutes); //
app.use("/api/tournaments", tournamentRoutes); //
app.use("/api/teams", teamRoutes); //
app.use("/api/matches", matchRoutes); //
app.use("/api/players", require("./routes/player")); //
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Football API running");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
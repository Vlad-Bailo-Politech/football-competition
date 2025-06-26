const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth"); //
const userRoutes = require("./routes/user"); //
const tournamentRoutes = require("./routes/tournament"); //
const teamRoutes = require("./routes/team"); //

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes); //
app.use("/api/users", userRoutes); //
app.use("/api/tournaments", tournamentRoutes); //
app.use("/api/teams", teamRoutes); //

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
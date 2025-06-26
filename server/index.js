const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth"); //

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes); //


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
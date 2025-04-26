const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());

app.use(bodyParser.json());

const landmarkRoutes = require("./routes/landmarks");
const visitedRoutes = require("./routes/visited");
app.use("/api", landmarkRoutes);
app.use("/api", visitedRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to my custom Node.js backend!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

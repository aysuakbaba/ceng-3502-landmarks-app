const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(bodyParser.json());

const landmarkRoutes = require("./routes/landmarks");
app.use("/api", landmarkRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to my custom Node.js backend!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

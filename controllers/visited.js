const fs = require("fs");
const path = require("path");

const visitedPath = path.join(__dirname, "../data/visitedLandmarks.json");
const getAllVisitedLandmarks = (req, res) => {
  try {
    const visitedLandmarks = JSON.parse(fs.readFileSync(visitedPath, "utf8"));
    res.json(visitedLandmarks);
  } catch (parseError) {
    console.error("Error parsing visited landmarks JSON:", parseError);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createVisitedLandmark = (req, res) => {
  const newVisitedLandmark = req.body;
  if (
    !newVisitedLandmark.landmark_id ||
    !newVisitedLandmark.visited_date ||
    !newVisitedLandmark.visitor_name
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const visitedLandmarks = JSON.parse(fs.readFileSync(visitedPath, "utf8"));
    newVisitedLandmark.id =
      visitedLandmarks.length > 0
        ? visitedLandmarks[visitedLandmarks.length - 1].id + 1
        : 1;
    visitedLandmarks.push(newVisitedLandmark);
    fs.writeFileSync(visitedPath, JSON.stringify(visitedLandmarks, null, 2));
    res.status(201).json(newVisitedLandmark);
  } catch (parseError) {
    console.error("Error parsing visited landmarks JSON:", parseError);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getVisitedLandmarkByID = (req, res) => {
  const { id } = req.params;
  try {
    const visitedLandmarks = JSON.parse(fs.readFileSync(visitedPath, "utf8"));
    const visitedLandmark = visitedLandmarks.find(
      (vlm) => vlm.id === parseInt(id)
    );
    if (!visitedLandmark) {
      return res.status(404).json({ error: "Visited landmark not found" });
    }
    res.json(visitedLandmark);
  } catch (parseError) {
    console.error("Error parsing visited landmarks JSON:", parseError);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllVisitedLandmarks,
  createVisitedLandmark,
  getVisitedLandmarkByID,
};

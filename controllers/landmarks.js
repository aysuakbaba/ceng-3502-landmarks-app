const fs = require("fs");
const path = require("path");

const landmarksPath = path.join(__dirname, "../data/landmarks.json");
const getAllLandmarks = (req, res) => {
  try {
    const landmarks = JSON.parse(fs.readFileSync(landmarksPath, "utf8"));
    res.json(landmarks);
  } catch (parseError) {
    console.error("Error parsing landmarks JSON:", parseError);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createLandmarks = (req, res) => {
  try {
    const landmarks = JSON.parse(fs.readFileSync(landmarksPath, "utf8"));
    const { name, location, description, category, note } = req.body;

    if (!name || !location || !description || !category || !note) {
      return res.status(400).json({
        error: "Missing required fields: name, location, description",
      });
    }

    const { lat, lng } = location;

    const newLandmark = {
      name,
      location: { lat: +lat, lng: +lng },
      description,
      category,
      note,
    };
    newLandmark.id =
      landmarks.length > 0 ? landmarks[landmarks.length - 1].id + 1 : 1;
    landmarks.push(newLandmark);
    fs.writeFileSync(landmarksPath, JSON.stringify(landmarks, null, 2));
    res.status(201).json(newLandmark);
  } catch (parseError) {
    console.error("Error parsing landmarks JSON:", parseError);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLandmark = (req, res) => {
  const { id } = req.params;
  try {
    const landmarks = JSON.parse(fs.readFileSync(landmarksPath, "utf8"));
    const landmark = landmarks.find((lms) => lms.id === parseInt(id));
    if (!landmark) {
      return res.status(404).json({ error: "Landmark not found" });
    }
    res.json(landmark);
  } catch (parseError) {
    console.error("Error parsing landmarks JSON:", parseError);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateLandmark = (req, res) => {
  const { id } = req.params;
  try {
    const landmarks = JSON.parse(fs.readFileSync(landmarksPath, "utf8"));
    const landmarkIndex = landmarks.findIndex((lms) => lms.id === parseInt(id));
    if (landmarkIndex === -1) {
      return res.status(404).json({ error: "Landmark not found" });
    }
    const updatedLandmark = { ...landmarks[landmarkIndex], ...req.body };
    landmarks[landmarkIndex] = updatedLandmark;
    fs.writeFileSync(landmarksPath, JSON.stringify(landmarks, null, 2));
    res.json(updatedLandmark);
  } catch (parseError) {
    console.error("Error parsing landmarks JSON:", parseError);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteLandmark = (req, res) => {
  const { id } = req.params;

  try {
    const landmarks = JSON.parse(fs.readFileSync(landmarksPath, "utf8"));
    const landmarkIndex = landmarks.findIndex((lms) => lms.id === parseInt(id));
    if (landmarkIndex === -1) {
      return res.status(404).json({ error: "Landmark not found" });
    }
    landmarks.splice(landmarkIndex, 1);
    fs.writeFileSync(landmarksPath, JSON.stringify(landmarks, null, 2));
    res.status(204).send();
  } catch (parseError) {
    console.error("Error parsing landmarks JSON:", parseError);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllLandmarks,
  createLandmarks,
  getLandmark,
  updateLandmark,
  deleteLandmark,
};

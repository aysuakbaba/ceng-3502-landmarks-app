const express = require("express");
const router = express.Router();
const controller = require("../controllers/landmarks");

// Route: GET /api/landmarks
router
  .route("/landmarks")
  .get(controller.getAllLandmarks)
  .post(controller.createLandmarks);
router
  .route("/landmarks/:id")
  .get(controller.getLandmark)
  .put(controller.updateLandmark)
  .delete(controller.deleteLandmark);

module.exports = router;

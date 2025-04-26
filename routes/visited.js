const express = require("express");
const router = express.Router();
const controller = require("../controllers/visited");

router
  .route("/visited")
  .get(controller.getAllVisitedLandmarks)
  .post(controller.createVisitedLandmark);

router.route("/visited/:id").get(controller.getVisitedLandmarkByID);
module.exports = router;

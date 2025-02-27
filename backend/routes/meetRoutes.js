const express = require("express");
const router = express.Router();
const meetController = require("../controllers/meetController");

router.post("/scheduleMeet",meetController.scheduleMeet);
router.get("/fetchEvents",meetController.fetchEvents);


module.exports = router;


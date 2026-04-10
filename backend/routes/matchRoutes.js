const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  sendRequest,
  respondRequest,
  getMessages,
} = require("../controllers/matchController");
const { getMatchById } = require("../controllers/matchController");

router.get("/:matchId", auth, getMatchById);
router.post("/request", auth, sendRequest);
router.post("/respond", auth, respondRequest);
router.get("/messages/:matchId", auth, getMessages);

module.exports = router;
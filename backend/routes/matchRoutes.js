const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getMessages,
  getMatchById,
  getUserMatches  // Import the new function
} = require("../controllers/matchController");

// IMPORTANT: Order matters - put specific routes before parameterized routes
router.get("/user/matches", auth, getUserMatches);  // This must come BEFORE /:matchId
router.post("/request", auth, sendRequest);
router.post("/accept/:matchId", auth, acceptRequest);
router.post("/reject/:matchId", auth, rejectRequest);
router.get("/messages/:matchId", auth, getMessages);
router.get("/:matchId", auth, getMatchById);  // This catches all, so put it last

module.exports = router;
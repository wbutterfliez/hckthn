const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeExchange,
  getIncomingRequests,
  getOutgoingRequests,
  getActiveExchanges,
  getCompletedExchanges,
  getMessages,
  getMatchById,
  getUserMatches,
} = require("../controllers/matchController");

// Requests
router.post("/request", auth, sendRequest);
router.post("/accept/:matchId", auth, acceptRequest);
router.post("/reject/:matchId", auth, rejectRequest);
router.delete("/cancel/:matchId", auth, cancelRequest);

// Exchange management
router.post("/complete/:matchId", auth, completeExchange);

router.get(
  "/requests/incoming",
  auth,
  getIncomingRequests
);

router.get(
  "/requests/outgoing",
  auth,
  getOutgoingRequests
);

router.get(
  "/exchanges/active",
  auth,
  getActiveExchanges
);

router.get(
  "/exchanges/completed",
  auth,
  getCompletedExchanges
);

// Existing chat routes
router.get(
  "/user/matches",
  auth,
  getUserMatches
);

router.get(
  "/messages/:matchId",
  auth,
  getMessages
);

// MUST BE LAST
router.get(
  "/:matchId",
  auth,
  getMatchById
);

module.exports = router;
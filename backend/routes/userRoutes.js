const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  updateProfile,
  getMatches,
  getProfile,
  getChats,
} = require("../controllers/userController");

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.get("/matches", auth, getMatches);
router.get("/chats", auth, getChats);

module.exports = router;
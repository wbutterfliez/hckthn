const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  updateProfile,
  getProfile,
  getMatches,
  getChats,
  searchUsers,
  getUserById,
} = require("../controllers/userController");

router.get("/profile", auth, getProfile);

router.put("/profile", auth, updateProfile);

router.get("/matches", auth, getMatches);

router.get("/chats", auth, getChats);

// NEW
router.get("/search", auth, searchUsers);

// NEW
router.get("/profile/:userId", auth, getUserById);

module.exports = router;
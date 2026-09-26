const User = require("../models/User");
const Match = require("../models/Match");
const Message = require("../models/Message");

// ✅ UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user,
      req.body,
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ GET MATCHES (for dashboard)
exports.getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user);

    const users = await User.find({
      _id: { $ne: req.user },
      $and: [
        {
          skillsOffered: {
            $elemMatch: { $in: currentUser.skillsWanted },
          },
        },
        {
          skillsWanted: {
            $elemMatch: { $in: currentUser.skillsOffered },
          },
        },
      ],
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ GET CHATS (ALL chats — pending, accepted, rejected)
exports.getChats = async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user,
    }).populate("users", "name");

    const messages = await Message.find({
      matchId: { $in: matches.map((m) => m._id) },
    }).sort({ createdAt: -1 });

    const chatMap = new Map();

    for (let msg of messages) {
      const match = matches.find(
        (m) => m._id.toString() === msg.matchId.toString()
      );

      if (!match) continue;

      const otherUser = match.users.find(
        (u) => u._id.toString() !== req.user
      );

      if (!otherUser) continue;

      const userId = otherUser._id.toString();

      // 🔥 THIS is the fix: group by USER, not match
      if (chatMap.has(userId)) continue;

      chatMap.set(userId, {
        matchId: match._id, // still needed for routing
        matchName: otherUser.name,
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt,
        unreadCount: 0,
      });
    }

    res.json(Array.from(chatMap.values()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio, skillsOffered, skillsWanted, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user,
      {
        bio,
        skillsOffered,
        skillsWanted,
        avatar,
        isProfileComplete: true,
      },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
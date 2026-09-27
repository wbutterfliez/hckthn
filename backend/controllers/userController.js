const User = require("../models/User");
const Match = require("../models/Match");
const Message = require("../models/Message");

// ======================================================
// UPDATE PROFILE
// ======================================================

exports.updateProfile = async (req, res) => {
  try {
    const {
      bio,
      skillsOffered,
      skillsWanted,
      avatar,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user,
      {
        bio,
        skillsOffered,
        skillsWanted,
        avatar,
        isProfileComplete: true,
      },
      {
        new: true,
      }
    );

    res.json(user);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// ======================================================
// GET MY PROFILE
// ======================================================

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .select("-password");

    res.json(user);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// ======================================================
// GET MATCHING USERS
// ======================================================

exports.getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user);

    const users = await User.find({
      _id: { $ne: req.user },

      $and: [
        {
          skillsOffered: {
            $elemMatch: {
              $in: currentUser.skillsWanted,
            },
          },
        },
        {
          skillsWanted: {
            $elemMatch: {
              $in: currentUser.skillsOffered,
            },
          },
        },
      ],
    });

    res.json(users);
  } catch (err) {
    console.error("GET MATCHES ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// ======================================================
// GET CHATS
// ======================================================

exports.getChats = async (req, res) => {
  try {
    const userId = req.user;

    const matches = await Match.find({
      users: userId,
    }).populate("users", "name");

    const messages = await Message.find({
      matchId: {
        $in: matches.map((m) => m._id),
      },
    }).sort({
      createdAt: -1,
    });

    const chatMap = new Map();

    for (const msg of messages) {
      const match = matches.find(
        (m) =>
          m._id.toString() ===
          msg.matchId.toString()
      );

      if (!match) continue;

      const otherUser = match.users.find(
        (user) =>
          user._id.toString() !==
          userId.toString()
      );

      if (!otherUser) continue;

      const otherUserId =
        otherUser._id.toString();

      if (chatMap.has(otherUserId)) {
        continue;
      }

      chatMap.set(otherUserId, {
        matchId: match._id,
        matchName: otherUser.name,
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt,
        status: match.status,
        unreadCount: 0,
      });
    }

    res.json(Array.from(chatMap.values()));
  } catch (err) {
    console.error("GET CHATS ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// ======================================================
// SEARCH USERS
// ======================================================

exports.searchUsers = async (req, res) => {
  try {
    const {
      search = "",
      type = "all",
    } = req.query;

    const currentUserId = req.user;

    const query = {
      _id: {
        $ne: currentUserId,
      },
    };

    if (search.trim()) {
      const regex = new RegExp(
        search.trim(),
        "i"
      );

      if (type === "offered") {
        query.skillsOffered = regex;
      } else if (type === "wanted") {
        query.skillsWanted = regex;
      } else {
        query.$or = [
          {
            name: regex,
          },
          {
            skillsOffered: regex,
          },
          {
            skillsWanted: regex,
          },
        ];
      }
    }

    const users = await User.find(query)
      .select(
        "name email bio avatar skillsOffered skillsWanted"
      )
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// GET OTHER USER'S PROFILE
// ======================================================

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.userId
    ).select(
      "name email bio avatar skillsOffered skillsWanted"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("GET USER ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
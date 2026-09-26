const Match = require("../models/Match");
const Message = require("../models/Message");
const User = require("../models/User");

// 🔥 SEND REQUEST
exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    // ❗ Check if match already exists
    const existing = await Match.findOne({
      users: { $all: [senderId, receiverId] },
    });

    if (existing) {
      return res.json({
        error: "ALREADY_SENT",
        match: existing, // still send match so frontend works
      });
    }

    // ✅ Create match
    const newMatch = await Match.create({
      users: [senderId, receiverId],
      initiatedBy: senderId,
      status: "pending",
    });

    // ✅ Save first message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      matchId: newMatch._id,
    });

    // 🔥 ALWAYS RETURN THIS FORMAT
    res.json({
      match: newMatch,
      message,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};



// Accept match request
exports.acceptRequest = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    // Request must still be pending
    if (match.status !== "pending") {
      return res.status(400).json({
        message: `Request is already ${match.status}`,
      });
    }

    // Only receiver can accept
    if (match.initiatedBy.toString() === userId.toString()) {
      return res.status(403).json({
        message: "Cannot accept your own request",
      });
    }

    match.status = "accepted";

    await match.save();

    res.json({
      success: true,
      match,
    });
  } catch (error) {
    console.error("ACCEPT REQUEST ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Reject match request
exports.rejectRequest = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    // Request must still be pending
    if (match.status !== "pending") {
      return res.status(400).json({
        message: `Request is already ${match.status}`,
      });
    }

    // Only receiver can reject
    if (match.initiatedBy.toString() === userId.toString()) {
      return res.status(403).json({
        message: "Cannot reject your own request",
      });
    }

    match.status = "rejected";

    await match.save();

    res.json({
      success: true,
      match,
    });
  } catch (error) {
    console.error("REJECT REQUEST ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get messages for a match
exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user;

    // Verify user is part of this match
    const match = await Match.findOne({
      _id: matchId,
      users: userId
    });

    if (!match) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({ matchId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get match by ID
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId).populate("users", "name");

    if (!match) {
      return res.status(404).json({ msg: "Match not found" });
    }

    const currentUserId = req.user.toString();

    const isReceiver = match.initiatedBy.toString() !== currentUserId;

    const otherUser = match.users.find(
      (u) => u._id.toString() !== currentUserId
    );

    res.json({
      matchId: match._id,
      status: match.status,
      isReceiver, // 🔥 TRUST THIS ONLY
      matchName: otherUser?.name || "Chat",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Add to matchController.js
exports.getUserMatches = async (req, res) => {
  try {
    const userId = req.user;

    const matches = await Match.find({
      users: userId,
      status: "accepted"
    })
    .populate("users", "name email")
    .populate("initiatedBy", "name email")
    .sort({ updatedAt: -1 });

    // Format matches with other user's info
    const formattedMatches = matches.map(match => {
      const otherUser = match.users.find(u => u._id.toString() !== userId.toString());
      return {
        _id: match._id,
        matchName: otherUser ? otherUser.name : "Chat",
        otherUserId: otherUser?._id,
        status: match.status,
        updatedAt: match.updatedAt
      };
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

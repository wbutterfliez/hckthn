const Match = require("../models/Match");
const Message = require("../models/Message");
const User = require("../models/User");

// ======================================================
// SEND REQUEST
// ======================================================

exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        msg: "Missing receiverId or content",
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        msg: "You cannot send a request to yourself",
      });
    }

    // Check if an active/pending match already exists
    const existing = await Match.findOne({
      users: { $all: [senderId, receiverId] },
      status: { $in: ["pending", "accepted"] },
    });

    if (existing) {
      return res.json({
        error: "ALREADY_SENT",
        match: existing,
      });
    }

    // Create match
    const newMatch = await Match.create({
      users: [senderId, receiverId],
      initiatedBy: senderId,
      status: "pending",
    });

    // Save first message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      matchId: newMatch._id,
    });

    res.status(201).json({
      match: newMatch,
      message,
    });
  } catch (err) {
    console.error("SEND REQUEST ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// ======================================================
// ACCEPT REQUEST
// ======================================================

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

    // Make sure user is actually part of match
    const isUserInMatch = match.users.some(
      (id) => id.toString() === userId.toString()
    );

    if (!isUserInMatch) {
      return res.status(403).json({
        message: "Not authorized",
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

// ======================================================
// REJECT REQUEST
// ======================================================

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

    const isUserInMatch = match.users.some(
      (id) => id.toString() === userId.toString()
    );

    if (!isUserInMatch) {
      return res.status(403).json({
        message: "Not authorized",
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

// ======================================================
// COMPLETE EXCHANGE
// ======================================================

exports.completeExchange = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    // Only active exchanges can be completed
    if (match.status !== "accepted") {
      return res.status(400).json({
        message: "Only active exchanges can be completed",
      });
    }

    // Check user belongs to exchange
    const isUserInMatch = match.users.some(
      (id) => id.toString() === userId.toString()
    );

    if (!isUserInMatch) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    match.status = "completed";

    await match.save();

    res.json({
      success: true,
      message: "Exchange completed",
      match,
    });
  } catch (error) {
    console.error("COMPLETE EXCHANGE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// INCOMING PENDING REQUESTS
// ======================================================

exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user;

    const matches = await Match.find({
      users: userId,
      status: "pending",
      initiatedBy: { $ne: userId },
    })
      .populate(
        "users",
        "name email skillsOffered skillsWanted avatar bio"
      )
      .populate(
        "initiatedBy",
        "name email skillsOffered skillsWanted avatar bio"
      )
      .sort({ createdAt: -1 });

    const formatted = matches.map((match) => {
      const sender = match.users.find(
        (user) =>
          user._id.toString() !== userId.toString()
      );

      return {
        _id: match._id,
        status: match.status,
        createdAt: match.createdAt,
        sender: sender,
        initiatedBy: match.initiatedBy,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("INCOMING REQUESTS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// OUTGOING PENDING REQUESTS
// ======================================================

exports.getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user;

    const matches = await Match.find({
      users: userId,
      status: "pending",
      initiatedBy: userId,
    })
      .populate(
        "users",
        "name email skillsOffered skillsWanted avatar bio"
      )
      .sort({ createdAt: -1 });

    const formatted = matches.map((match) => {
      const receiver = match.users.find(
        (user) =>
          user._id.toString() !== userId.toString()
      );

      return {
        _id: match._id,
        status: match.status,
        createdAt: match.createdAt,
        receiver: receiver,
        initiatedBy: match.initiatedBy,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("OUTGOING REQUESTS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// ACTIVE EXCHANGES
// ======================================================

exports.getActiveExchanges = async (req, res) => {
  try {
    const userId = req.user;

    const matches = await Match.find({
      users: userId,
      status: "accepted",
    })
      .populate(
        "users",
        "name email skillsOffered skillsWanted avatar bio"
      )
      .sort({ updatedAt: -1 });

    const formatted = matches.map((match) => {
      const otherUser = match.users.find(
        (user) =>
          user._id.toString() !== userId.toString()
      );

      return {
        _id: match._id,
        status: match.status,
        otherUser: otherUser,
        initiatedBy: match.initiatedBy,
        updatedAt: match.updatedAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("ACTIVE EXCHANGES ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// COMPLETED EXCHANGES
// ======================================================

exports.getCompletedExchanges = async (req, res) => {
  try {
    const userId = req.user;

    const matches = await Match.find({
      users: userId,
      status: "completed",
    })
      .populate(
        "users",
        "name email skillsOffered skillsWanted avatar bio"
      )
      .sort({ updatedAt: -1 });

    const formatted = matches.map((match) => {
      const otherUser = match.users.find(
        (user) =>
          user._id.toString() !== userId.toString()
      );

      return {
        _id: match._id,
        status: match.status,
        otherUser: otherUser,
        initiatedBy: match.initiatedBy,
        completedAt: match.updatedAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("COMPLETED EXCHANGES ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// GET MESSAGES FOR A MATCH
// ======================================================

exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user;

    const match = await Match.findOne({
      _id: matchId,
      users: userId,
    });

    if (!match) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const messages = await Message.find({ matchId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// GET MATCH BY ID
// ======================================================

exports.getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;
    const currentUserId = req.user;

    const match = await Match.findOne({
      _id: matchId,
      users: currentUserId,
    }).populate("users", "name");

    if (!match) {
      return res.status(404).json({
        msg: "Match not found",
      });
    }

    const isReceiver =
      match.initiatedBy.toString() !==
      currentUserId.toString();

    const otherUser = match.users.find(
      (user) =>
        user._id.toString() !==
        currentUserId.toString()
    );

    res.json({
      matchId: match._id,
      status: match.status,
      isReceiver,
      matchName: otherUser?.name || "Chat",
      otherUserId: otherUser?._id,
    });
  } catch (err) {
    console.error("GET MATCH ERROR:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// ======================================================
// GET USER'S ACTIVE MATCHES
// ======================================================

exports.getUserMatches = async (req, res) => {
  try {
    const userId = req.user;

    const matches = await Match.find({
      users: userId,
      status: "accepted",
    })
      .populate("users", "name email")
      .populate("initiatedBy", "name email")
      .sort({ updatedAt: -1 });

    const formattedMatches = matches.map((match) => {
      const otherUser = match.users.find(
        (user) =>
          user._id.toString() !== userId.toString()
      );

      return {
        _id: match._id,
        matchName: otherUser
          ? otherUser.name
          : "Chat",
        otherUserId: otherUser?._id,
        status: match.status,
        updatedAt: match.updatedAt,
      };
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error("GET USER MATCHES ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const userId = req.user;
    const { matchId } = req.params;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only the person who sent the request can cancel it
    if (match.initiatedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Only the sender can cancel this request",
      });
    }

    // Can only cancel pending requests
    if (match.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be cancelled",
      });
    }

    // Delete messages belonging to this request
    await Message.deleteMany({
      matchId: match._id,
    });

    // Delete the request itself
    await Match.findByIdAndDelete(match._id);

    res.json({
      success: true,
      message: "Request cancelled",
    });
  } catch (error) {
    console.error("CANCEL REQUEST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
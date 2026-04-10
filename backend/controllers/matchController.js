const Match = require("../models/Match");
const Message = require("../models/Message");

// ✅ SEND REQUEST (no duplicate matches)
exports.sendRequest = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    // 🔥 check existing match
    let match = await Match.findOne({
      users: { $all: [req.user, receiverId] },
    });

    // 🔥 create ONLY if not exists
    if (!match) {
      match = await Match.create({
        users: [req.user, receiverId],
        initiatedBy: req.user,
        status: "pending",
      });
    }

    // ✅ save first message (optional but useful)
    let message = null;
    if (content && content.trim()) {
      message = await Message.create({
        sender: req.user,
        receiver: receiverId,
        content,
        matchId: match._id,
      });
    }

    res.json({ match, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ ACCEPT / REJECT
exports.respondRequest = async (req, res) => {
  try {
    const { matchId, action } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ msg: "Match not found" });

    match.status = action; // "accepted" or "rejected"
    await match.save();

    res.json(match);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ GET MESSAGES (for chat history)
exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;

    const messages = await Message.find({ matchId }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId).populate("users", "name");

    if (!match) return res.status(404).json({ msg: "Match not found" });

    const otherUser = match.users.find(
      (u) => u._id.toString() !== req.user
    );

    res.json({
      matchId: match._id,
      matchName: otherUser?.name || "Chat",
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
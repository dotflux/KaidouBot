import mongoose from "mongoose";

const duelSchema = new mongoose.Schema(
  {
    challengerId: { type: String, required: true },
    opponentId: { type: String, required: true },
    users: {
      type: [String],
      required: true,
      validate: [
        (arr: string[]) => arr.length === 2,
        "Users array must have exactly 2 players",
      ],
    },
  },
  { timestamps: true }
);

export const DuelModel = mongoose.model("Duel", duelSchema);

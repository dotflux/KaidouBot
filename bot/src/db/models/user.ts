import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  faction: {
    type: String,
    enum: ["pirate", "marine", "ra", "bh"],
    required: true,
  },
  race: {
    type: String,
    enum: ["human", "mink", "cyborg", "fishman"],
    required: true,
  },
  money: { type: Number, default: 0 },
  inventory: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model("User", userSchema);

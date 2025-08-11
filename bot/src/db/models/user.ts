import mongoose from "mongoose";

const moveSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["offense", "defense", "special"],
      required: true,
    },
    power: { type: Number, required: true },
    description: { type: String },
  },
  { _id: false }
);

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
  fightingStyle: {
    type: String,
    enum: ["fishmanKarate", "electricClaw", "mechanics", "hands"],
    required: true,
  },
  equippedWeapon: { type: String },
  moves: {
    type: Map,
    of: [moveSchema],
    default: {},
  },
  rokushiki: { type: [String], default: [] },
  money: { type: Number, default: 0 },
  maxHp: { type: Number, default: 50 },
  maxDef: { type: Number, default: 50 },
  initialDef: { type: Number, default: 0 },
  currentDf: { type: String, default: "" },
  inventory: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model("User", userSchema);

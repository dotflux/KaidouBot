import mongoose from "mongoose";
import { MoveData } from "../../logic/duel/moves";

const moveSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["offense", "defense", "special"],
      required: true,
    },
    power: { type: Number },
    recoil: { type: Number },
    buffType: { type: String },
    buffPower: { type: Number },
    form: { type: String },
    formBuffType: { type: String },
    formBuff: { type: Number },
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
  money: { type: Number, default: 500 },
  gems: { type: Number, default: 0 },
  maxHp: { type: Number, default: 50 },
  maxDef: { type: Number, default: 50 },
  initialDef: { type: Number, default: 0 },
  speed: { type: Number, default: 10 },
  resistance: { type: Number, default: 0 },
  currentDf: { type: String, default: "" },
  xp: { type: Number, default: 0 },
  nextRankXp: { type: Number, default: 100 },
  duelsWon: { type: Number, default: 0 },
  duelsLost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model("User", userSchema);

export async function addMoveToUser(
  userId: string,
  styleKey: string,
  move: MoveData
): Promise<{ ok: true; newCount: number } | { ok: false; reason: string }> {
  const nameKey = move.name;

  // 1) if a move with same name already exists in that style, bail out
  const exists = await UserModel.findOne({
    userId,
    [`moves.${styleKey}.name`]: nameKey,
  })
    .lean()
    .exec();

  if (exists) {
    return { ok: false, reason: "The move already exists" };
  }

  // 2) Try to push into existing array atomically if the array exists
  const pushRes = await UserModel.updateOne(
    { userId, [`moves.${styleKey}`]: { $exists: true } },
    { $push: { [`moves.${styleKey}`]: move } }
  ).exec();

  if (pushRes.matchedCount && pushRes.modifiedCount) {
    const doc = await UserModel.findOne({ userId }).lean().exec();
    const count = ((doc as any)?.moves?.[styleKey] || []).length;
    return { ok: true, newCount: count };
  }

  // 3) Array doesn't exist ? create it with the move
  await UserModel.updateOne(
    { userId },
    { $set: { [`moves.${styleKey}`]: [move] } }
  ).exec();

  const doc = await UserModel.findOne({ userId }).lean().exec();
  const count = ((doc as any)?.moves?.[styleKey] || []).length;
  return { ok: true, newCount: count };
}

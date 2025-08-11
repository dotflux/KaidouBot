import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["chest", "sword", "devilFruit", "armor", "misc"],
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    rarity: { type: String, enum: ["common", "rare", "epic", "legendary"] },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // store type-specific fields here
  },
  { _id: false }
);

const inventorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [inventoryItemSchema],
});

export const InventoryModel = mongoose.model("Inventory", inventorySchema);

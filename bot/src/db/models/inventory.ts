import mongoose from "mongoose";
import { humanize } from "../../logic/emojis/capitalize";

const inventoryItemInnerSchema = new mongoose.Schema(
  {
    quantity: { type: Number, default: 1 },
    rarity: { type: String, enum: ["common", "rare", "epic", "legendary"] },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const inventorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true, unique: true },
  items: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

export const makeItemKey = (name: string): string => {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  if (/^[a-z0-9_-]+$/.test(lower)) return lower;

  return lower.replace(/[.\s$]+/g, "_").replace(/[^a-z0-9_-]/g, "");
};

export const InventoryModel = mongoose.model("Inventory", inventorySchema);

export async function addItemToInventory(
  userId: string,
  type: string,
  name: string,
  rarity: "common" | "rare" | "epic" | "legendary",
  quantity: number
): Promise<number> {
  const itemKey = makeItemKey(name);
  const basePath = `items.${type}.${itemKey}`;

  // 1) If item path already exists, just increment quantity (atomic)
  const incOnly = await InventoryModel.updateOne(
    { userId, [`${basePath}`]: { $exists: true } },
    { $inc: { [`${basePath}.quantity`]: quantity } }
  );

  if (incOnly.matchedCount && incOnly.matchedCount > 0) {
    const doc = await InventoryModel.findOne({ userId }).lean();
    const docAny = doc as any;
    return docAny?.items?.[type]?.[itemKey]?.quantity ?? 0;
  }

  // 2) Item path doesn't exist yet: create the nested path and increment (upsert)
  await InventoryModel.updateOne(
    { userId },
    {
      $set: {
        [`${basePath}.rarity`]: rarity,
        [`${basePath}.data.displayName`]: humanize(name),
      },
      $inc: { [`${basePath}.quantity`]: quantity },
    },
    { upsert: true }
  );

  const doc = await InventoryModel.findOne({ userId }).lean();
  const docAny = doc as any;
  return docAny?.items?.[type]?.[itemKey]?.quantity ?? quantity;
}

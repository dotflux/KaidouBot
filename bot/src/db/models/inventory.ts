import mongoose from "mongoose";
import { humanize } from "../../logic/emojis/capitalize";
import { Rarity } from "../../types";

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

export async function findItemInInventory(
  userId: string,
  type: string,
  nameOrKey: string
): Promise<
  | {
      ok: true;
      itemKey: string;
      item: { quantity: number; rarity?: Rarity; data?: Record<string, any> };
    }
  | { ok: false; reason: "no_inventory" | "not_found" | "no_user" }
> {
  const inv = await InventoryModel.findOne({ userId }).lean().exec();
  if (!inv) return { ok: false, reason: "no_user" };

  const itemsRaw =
    inv.items instanceof Map
      ? Object.fromEntries(inv.items as any)
      : (inv.items as any) || {};

  const itemKey = makeItemKey(nameOrKey);
  const collection = (itemsRaw[type] as Record<string, any>) || {};

  const entry = collection[itemKey];
  if (!entry) return { ok: false, reason: "not_found" };

  // Normalize returned shape
  const item = {
    quantity: Number(entry.quantity ?? 0),
    rarity: entry.rarity,
    data: entry.data ?? {},
  };

  return { ok: true, itemKey, item };
}

export async function removeItemFromInventory(
  userId: string,
  type: string,
  nameOrKey: string,
  quantityToRemove = 1
): Promise<
  | { ok: true; newQuantity: number } // newQuantity after removal (0 if removed)
  | { ok: false; reason: "no_inventory" | "not_found" | "nothing_to_remove" }
> {
  if (quantityToRemove <= 0) {
    return { ok: false, reason: "nothing_to_remove" };
  }

  const itemKey = makeItemKey(nameOrKey);
  const basePath = `items.${type}.${itemKey}.quantity`;
  const itemPathRoot = `items.${type}.${itemKey}`;

  // Attempt atomic decrement if item exists
  const decRes = await InventoryModel.updateOne(
    { userId, [`items.${type}.${itemKey}`]: { $exists: true } },
    { $inc: { [basePath]: -Math.floor(quantityToRemove) } }
  ).exec();

  if (!decRes.matchedCount || decRes.matchedCount === 0) {
    return { ok: false, reason: "not_found" };
  }

  // Fetch current quantity
  const doc = await InventoryModel.findOne({ userId }).lean().exec();
  const docAny = doc as any;
  const currQty = Number(docAny?.items?.[type]?.[itemKey]?.quantity ?? 0);

  if (currQty > 0) {
    return { ok: true, newQuantity: currQty };
  }

  // quantity is <= 0 -> remove the item entry entirely
  const unsetRes = await InventoryModel.updateOne(
    { userId },
    { $unset: { [itemPathRoot]: "" } }
  ).exec();

  // If the type map object became empty (no keys), remove that type map as well
  const refreshed = await InventoryModel.findOne({ userId }).lean().exec();
  const refreshedAny = refreshed as any;
  const typeObj = refreshedAny?.items?.[type] ?? null;
  if (typeObj && Object.keys(typeObj).length === 0) {
    await InventoryModel.updateOne(
      { userId },
      { $unset: { [`items.${type}`]: "" } }
    ).exec();
  }

  return { ok: true, newQuantity: 0 };
}

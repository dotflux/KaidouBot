import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { UserModel } from "../../../db/models/user";
import { MoveData } from "../moves";
import fsMovesJson from "../../../moves/fsMoves.json";
import redisClient from "../../../db/redis";

const MAX_OPTIONS = 25;
const MAX_LABEL = 100;
const MAX_DESC = 100;

function truncate(s: string | undefined, max = 100) {
  if (!s) return "";
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

export const buildFightingStyleMoveDropdown = async (
  userId: string,
  duelId: string
): Promise<StringSelectMenuBuilder | null> => {
  // 1) load user minimally - lean() returns a plain object (faster than Mongoose doc)
  //    we only need 'moves' and 'fightingStyle' fields
  const user = await UserModel.findOne({ userId })
    .select({ moves: 1, fightingStyle: 1 })
    .lean()
    .exec();

  if (!user) return null;

  const styleKey: string = (user as any).fightingStyle;
  const fsMoves: MoveData[] =
    ((user as any).moves?.[styleKey] as MoveData[]) || [];

  if (!fsMoves || fsMoves.length === 0) return null;

  // 2) limit & map to API option objects (no builder per option)
  const options = fsMoves.slice(0, MAX_OPTIONS).map((move) => {
    const label = truncate(move.name, MAX_LABEL);
    // describe based on move type safely
    let desc = "";
    if (move.type === "buff") {
      desc = `Type: ${move.type}, Buff: ${(move as any).buffType}, Power: ${
        (move as any).buffPower
      }`;
    } else if (move.type === "transformation") {
      desc = `Type: ${move.type}, Form: ${(move as any).form}`;
    } else {
      desc = `Power: ${move.power ?? "—"}, Type: ${move.type}, ${
        move.description ?? "No description"
      }`;
    }
    desc = truncate(desc, MAX_DESC);

    return {
      label,
      value: move.name,
      description: desc,
    };
  });

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId(`duelActionFs_${duelId}_${userId}`)
    .setPlaceholder("Select your move")
    .setMinValues(1)
    .setMaxValues(1)
    // addOptions accepts array of API option objects
    .addOptions(options as any);

  return dropdown;
};

export const buildDevilFruitMoveDropdown = async (
  userId: string,
  duelId: string
): Promise<StringSelectMenuBuilder | null> => {
  const user = await UserModel.findOne({ userId })
    .select({ moves: 1, currentDf: 1 })
    .lean()
    .exec();

  if (!user) return null;

  const styleKey: string = (user as any).currentDf;
  const fsMoves: MoveData[] =
    ((user as any).moves?.[styleKey] as MoveData[]) || [];

  if (!fsMoves || fsMoves.length === 0) return null;

  // 2) limit & map to API option objects (no builder per option)
  const options = fsMoves.slice(0, MAX_OPTIONS).map((move) => {
    const label = truncate(move.name, MAX_LABEL);
    // describe based on move type safely
    let desc = "";
    if (move.type === "buff") {
      desc = `Type: ${move.type}, Buff: ${(move as any).buffType}, Power: ${
        (move as any).buffPower
      }`;
    } else if (move.type === "transformation") {
      desc = `Type: ${move.type}, Form: ${(move as any).form}`;
    } else {
      desc = `Power: ${move.power ?? "—"}, Type: ${move.type}, ${
        move.description ?? "No description"
      }`;
    }
    desc = truncate(desc, MAX_DESC);

    return {
      label,
      value: move.name,
      description: desc,
    };
  });

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId(`duelActionDf_${duelId}_${userId}`)
    .setPlaceholder("Select your move")
    .setMinValues(1)
    .setMaxValues(1)
    // addOptions accepts array of API option objects
    .addOptions(options as any);

  return dropdown;
};

export const buildTransformationDropdown = async (
  userId: string,
  duelId: string
): Promise<StringSelectMenuBuilder | null> => {
  // 1) Get the user's current form from Redis
  const formKey = await redisClient.hGet(`duel:${duelId}`, `${userId}:form`);
  if (!formKey) return null;

  // 2) Get moves directly from fsMoves
  const movesForForm =
    (fsMovesJson as Record<string, MoveData[]>)[formKey] || [];
  if (movesForForm.length === 0) return null;

  // 3) Slice, map, and prepare options
  const options = movesForForm.slice(0, MAX_OPTIONS).map((move) => {
    const label = truncate(move.name, MAX_LABEL);
    let desc = "";

    if (move.type === "buff") {
      desc = `Type: ${move.type}, Buff: ${(move as any).buffType}, Power: ${
        (move as any).buffPower
      }`;
    } else if (move.type === "transformation") {
      desc = `Type: ${move.type}, Form: ${(move as any).form}`;
    } else {
      desc = `Power: ${move.power ?? "—"}, Type: ${move.type}, ${
        move.description ?? "No description"
      }`;
    }
    desc = truncate(desc, MAX_DESC);

    return {
      label,
      value: move.name,
      description: desc,
    };
  });

  // 4) Build dropdown
  const dropdown = new StringSelectMenuBuilder()
    .setCustomId(`duelActionTf_${duelId}_${userId}`)
    .setPlaceholder("Select your move")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(options as any);

  return dropdown;
};

export const buildRokushikiDropdown = async (
  userId: string,
  duelId: string
) => {};
export const buildWeaponDropdown = async (userId: string, duelId: string) => {};

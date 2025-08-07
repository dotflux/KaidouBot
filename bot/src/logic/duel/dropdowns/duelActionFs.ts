import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { UserModel } from "../../../db/models/user";

export const buildFightingStyleMoveDropdown = async (
  userId: string,
  duelId: string
) => {
  const user = await UserModel.findOne({ userId });
  if (!user) return null;

  const fsMoves = user.moves.get(user.fightingStyle) || [];

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId(`duelActionFs_${duelId}_${userId}`)
    .setPlaceholder("Select your move")
    .setMinValues(1)
    .setMaxValues(1);

  for (const move of fsMoves) {
    dropdown.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(move.name)
        .setValue(move.name)
        .setDescription(
          `Power: ${move.power}, Type: ${move.type}, Description: ${
            move.description || "No description"
          }`
        )
    );
  }

  return dropdown;
};

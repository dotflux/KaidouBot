import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { finalRegisterEmbed } from "./embeds/finalRegisterEmbed";
import { errorEmbed } from "./errorEmbed";
import { Faction, Race } from "../../types";
import { UserModel } from "../../db/models/user";
import fsMoves from "../../moves/fsMoves.json";
import { InventoryModel } from "../../db/models/inventory";

const setFs = (race: string) => {
  switch (race) {
    case "human":
      return "hands";
    case "mink":
      return "electricClaw";
    case "cyborg":
      return "mechanics";
    case "fishman":
      return "fishmanKarate";
    default:
      return "";
  }
};

export const registerUser = async (
  interaction: StringSelectMenuInteraction,
  faction: Faction,
  race: Race
) => {
  if (!faction || !race) {
    const embed = errorEmbed("You did not pick a faction or race");
    await interaction.update({
      embeds: [embed],
      components: [],
    });
    return;
  }

  const user = await UserModel.findOne({ userId: interaction.user.id });
  if (user) {
    const embed = errorEmbed("You are already registered!");
    await interaction.update({
      embeds: [embed],
      components: [],
    });
    return;
  }

  const fightingStyle = setFs(race);
  const baseMoves =
    (fsMoves as Record<string, any[]>)[fightingStyle]?.slice(0, 2) ?? [];

  const newUser = new UserModel({
    userId: interaction.user.id,
    faction,
    race,
    fightingStyle,
    moves: {
      [fightingStyle]: baseMoves,
    },
    maxHp: race === "human" ? 70 : 50,
    initialDef: race === "fishman" || race === "cyborg" ? 30 : 0,
    maxDef: race === "fishman" || race === "cyborg" ? 80 : 50,
    speed: race === "mink" ? 30 : 10,
  });
  const newUserInventory = new InventoryModel({
    userId: interaction.user.id,
  });
  await Promise.all([newUser.save(), newUserInventory.save()]);

  const embed = finalRegisterEmbed(faction, race);
  await interaction.update({
    embeds: [embed],
    components: [],
  });
};

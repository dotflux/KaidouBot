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

  const newUser = new UserModel({
    userId: interaction.user.id,
    faction,
    race,
  });
  await newUser.save();

  const embed = finalRegisterEmbed(faction, race);
  await interaction.update({
    embeds: [embed],
    components: [],
  });
};

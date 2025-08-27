import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { RARITIES, Rarity } from "../types";
import { errorEmbed } from "../logic/register/errorEmbed";
import { openChest } from "../logic/chests/openChest";

export const data = new SlashCommandBuilder()
  .setName("chest")
  .setDescription("Developer cheat commands")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("open")
      .setDescription("Open a chest from your inventory")
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Type of the chest")
          .setRequired(true)
          .addChoices(...RARITIES.map((r) => ({ name: r, value: r })))
      )
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  try {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "open":
        const type = interaction.options.getString("type", true);
        await openChest(interaction, type as Rarity);
        break;
      default:
        const error = errorEmbed("Unknown cheat command");
        await interaction.reply({
          embeds: [error],
          flags: MessageFlags.Ephemeral,
        });
        break;
    }
  } catch (error) {
    console.log(error);
  }
};

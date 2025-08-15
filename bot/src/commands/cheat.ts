import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import * as dotenv from "dotenv";
import { itemCheat, ITEM_TYPES } from "../logic/cheat/itemCheat";
import { RARITIES, Rarity } from "../types";
import { StatCheat, CHEATSTATS, statCheat } from "../logic/cheat/statCheat";
dotenv.config();

export const data = new SlashCommandBuilder()
  .setName("cheat")
  .setDescription("Developer cheat commands")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("item")
      .setDescription("Spawn or modify an item")
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Type of the item (e.g., fruit, chest)")
          .setRequired(true)
          .addChoices(...ITEM_TYPES.map((t) => ({ name: t, value: t })))
      )
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of the item")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("rarity")
          .setDescription("Rarity of the item")
          .setRequired(true)
          .addChoices(...RARITIES.map((r) => ({ name: r, value: r })))
      )
      .addNumberOption((option) =>
        option
          .setName("quantity")
          .setDescription("Quantity to add or remove")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("stat")
      .setDescription("Modify your stats")
      .addStringOption((option) =>
        option
          .setName("stat")
          .setDescription("Type of the stat")
          .setRequired(true)
          .addChoices(...CHEATSTATS.map((s) => ({ name: s, value: s })))
      )
      .addNumberOption((option) =>
        option
          .setName("amount")
          .setDescription("Amount to set")
          .setRequired(true)
      )
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  try {
    const subcommand = interaction.options.getSubcommand();
    if (interaction.user.id !== process.env.DEV_ID) {
      await interaction.reply({
        content: `You're not a developer`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    switch (subcommand) {
      case "item":
        const type = interaction.options.getString("type", true);
        const name = interaction.options.getString("name", true);
        const quantity = interaction.options.getNumber("quantity", true);
        const rarityRaw = interaction.options.getString("rarity", true);
        const rarity = rarityRaw as Rarity;
        await itemCheat(interaction, type, name, rarity, quantity);
        break;
      case "stat":
        const statRaw = interaction.options.getString("stat", true);
        const amount = interaction.options.getNumber("amount", true);
        const stat = statRaw as StatCheat;
        await statCheat(interaction, stat, amount);
        break;
      default:
        await interaction.reply({
          content: "Unknown cheat command.",
          flags: MessageFlags.Ephemeral,
        });
    }
  } catch (error) {
    console.log(error);
  }
};

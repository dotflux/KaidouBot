import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import * as dotenv from "dotenv";
import { itemCheat, ITEM_TYPES } from "../logic/cheat/itemCheat";
import { RARITIES, Rarity } from "../types";
import { StatCheat, CHEATSTATS, statCheat } from "../logic/cheat/statCheat";
import { moneyCheat } from "../logic/cheat/moneyCheat";
import { moveCheat } from "../logic/cheat/moveCheat";
import { gemCheat } from "../logic/cheat/gemCheat";

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
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("money")
      .setDescription("Increase your money")
      .addNumberOption((option) =>
        option
          .setName("amount")
          .setDescription("Amount to set")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("gems")
      .setDescription("Increase your gems")
      .addNumberOption((option) =>
        option
          .setName("amount")
          .setDescription("Amount to set")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("move")
      .setDescription("Add a move to your profile")
      .addStringOption((option) =>
        option
          .setName("style")
          .setDescription("Style/Df/Whatever name")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of the move")
          .setRequired(true)
      )
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  try {
    const subcommand = interaction.options.getSubcommand();
    const devIds = process.env.DEV_ID?.split(",") ?? [];
    if (!devIds.includes(interaction.user.id)) {
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
        const amountStat = interaction.options.getNumber("amount", true);
        const stat = statRaw as StatCheat;
        await statCheat(interaction, stat, amountStat);
        break;
      case "money":
        const amountMoney = interaction.options.getNumber("amount", true);
        await moneyCheat(interaction, amountMoney);
        break;
      case "gems":
        const amountGem = interaction.options.getNumber("amount", true);
        await gemCheat(interaction, amountGem);
        break;
      case "move":
        const moveStyle = interaction.options.getString("style", true);
        const moveName = interaction.options.getString("name", true);
        await moveCheat(interaction, moveStyle, moveName);
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

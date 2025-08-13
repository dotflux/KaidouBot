import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import * as dotenv from "dotenv";
import { itemCheat } from "../logic/cheat/itemCheat";
import { RARITIES, Rarity } from "../types";
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
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();
  if (interaction.user.id !== process.env.DEV_ID) {
    await interaction.reply({
      content: `You're not a developer`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (subcommand === "item") {
    const type = interaction.options.getString("type", true);
    const name = interaction.options.getString("name", true);
    const quantity = interaction.options.getNumber("quantity", true);
    const rarityRaw = interaction.options.getString("rarity", true);
    const rarity = rarityRaw as Rarity;
    await itemCheat(interaction, type, name, rarity, quantity);
  } else {
    await interaction.reply({
      content: "Unknown cheat command.",
      flags: MessageFlags.Ephemeral,
    });
  }
};

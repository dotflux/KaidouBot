import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { inventoryFetch } from "../logic/inventory/inventoryFetch";

export const data = new SlashCommandBuilder()
  .setName("inventory")
  .setDescription("Check different inventory categories")
  .addSubcommand((subcommand) =>
    subcommand.setName("fruits").setDescription("Check your fruit inventory")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("chests").setDescription("Check your chest inventory")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("swords").setDescription("Check your sword inventory")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("guns").setDescription("Check your gun inventory")
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case "fruits":
      await inventoryFetch(interaction, "devilFruit");
      break;

    case "chests":
      await inventoryFetch(interaction, "chest");
      break;

    case "swords":
      await inventoryFetch(interaction, "swords");
      break;

    case "guns":
      await inventoryFetch(interaction, "guns");
      break;

    default:
      await interaction.reply({
        content: "Unknown subcommand.",
        flags: MessageFlags.Ephemeral,
      });
  }
};

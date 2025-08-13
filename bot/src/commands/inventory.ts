import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";

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
      await interaction.reply({
        content: "Here are your fruits...",
        flags: MessageFlags.Ephemeral,
      });
      break;

    case "chests":
      await interaction.reply({
        content: "Here are your chests...",
        flags: MessageFlags.Ephemeral,
      });
      break;

    case "swords":
      await interaction.reply({
        content: "Here are your swords...",
        flags: MessageFlags.Ephemeral,
      });
      break;

    case "guns":
      await interaction.reply({
        content: "Here are your guns...",
        flags: MessageFlags.Ephemeral,
      });
      break;

    default:
      await interaction.reply({
        content: "Unknown subcommand.",
        flags: MessageFlags.Ephemeral,
      });
  }
};

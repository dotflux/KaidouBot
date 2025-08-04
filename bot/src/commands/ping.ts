import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply({ content: "Pong!", flags: MessageFlags.Ephemeral });
};

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { initialRegister } from "../logic/register/initialRegister";
import { UserModel } from "../db/models/user";
import { errorEmbed } from "../logic/register/errorEmbed";

export const data = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Register a new user");

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const user = await UserModel.findOne({ userId: interaction.user.id });
  if (user) {
    const embed = errorEmbed("You are already registered!");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await initialRegister(interaction);
};

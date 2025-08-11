import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { UserModel } from "../db/models/user";
import { errorEmbed } from "../logic/register/errorEmbed";
import { sendProfile } from "../logic/profile/sendProfile";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Shows in-game profile");

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const user = await UserModel.findOne({ userId: interaction.user.id });
  if (!user) {
    const embed = errorEmbed("You are not registered!");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await sendProfile(interaction);
};

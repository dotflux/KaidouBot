import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { UserModel } from "../db/models/user";
import { errorEmbed } from "../logic/register/errorEmbed";
import { initialDuel } from "../logic/duel/initialDuel";
import { DuelModel } from "../db/models/duel";

export const data = new SlashCommandBuilder()
  .setName("duel")
  .setDescription("Start a duel with a player")
  .addUserOption((option) =>
    option
      .setName("opponent")
      .setDescription("The person you wish to challenge")
      .setRequired(true)
  );

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

  const opponent = interaction.options.getUser("opponent", true);
  if (interaction.user.id === opponent.id) {
    const embed = errorEmbed("You cant duel yourself");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const opponentUser = await UserModel.findOne({ userId: opponent.id });
  if (!opponentUser) {
    const embed = errorEmbed("Opponent is not registered!");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const userInDuel = await DuelModel.findOne({users:interaction.user.id})
  if (userInDuel){
    const embed = errorEmbed("You are already in a duel!");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const opponentInDuel = await DuelModel.findOne({users:opponent.id})
  if (opponentInDuel){
    const embed = errorEmbed("Opponent is alredy in a duel!");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await initialDuel(interaction, opponent);
};

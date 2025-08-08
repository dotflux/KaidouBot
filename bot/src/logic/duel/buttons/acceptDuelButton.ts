import { MessageFlags, ButtonInteraction } from "discord.js";
import { errorEmbed } from "../../register/errorEmbed";
import { createDuelBattleground } from "../createDuelGround";
import { DuelModel } from "../../../db/models/duel";

export const execute = async (interaction: ButtonInteraction) => {
  try {
    // Verify the user who clicked is the same opponent
    const customIdParts = interaction.customId.split("_");
    const expectedUserId = customIdParts[2];

    if (interaction.user.id !== expectedUserId) {
      const embed = errorEmbed("This invitation is not for you!");
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const canInteract = [customIdParts[1], customIdParts[2]];
    const challenger = await interaction.client.users.fetch(canInteract[0]);
    const opponent = interaction.user;

    const userInDuel = await DuelModel.findOne({ users: challenger.id });
    if (userInDuel) {
      const embed = errorEmbed("You are already in a duel!");
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const opponentInDuel = await DuelModel.findOne({ users: opponent.id });
    if (opponentInDuel) {
      const embed = errorEmbed("Opponent is alredy in a duel!");
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await createDuelBattleground(interaction, canInteract, {
      challenger,
      opponent,
    });
  } catch (error) {
    console.log(error);
  }
};

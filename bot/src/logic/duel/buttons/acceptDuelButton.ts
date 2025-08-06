import { MessageFlags, ButtonInteraction } from "discord.js";
import { errorEmbed } from "../../register/errorEmbed";
import { createDuelBattleground } from "../createDuelGround";

export const execute = async (interaction: ButtonInteraction) => {
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

  await createDuelBattleground(interaction, canInteract, {
    challenger,
    opponent,
  });
};

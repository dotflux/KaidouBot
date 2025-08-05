import { MessageFlags, ButtonInteraction } from "discord.js";
import { errorEmbed } from "../../register/errorEmbed";

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
  await interaction.reply({
    content: "YOU ACCEPTED!",
    flags: MessageFlags.Ephemeral,
  });
};

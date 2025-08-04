import { StringSelectMenuInteraction, MessageFlags } from "discord.js";
import { registerUser } from "../registerUser";
import { Faction, Race } from "../../../types";
import { errorEmbed } from "../errorEmbed";

export const execute = async (interaction: StringSelectMenuInteraction) => {
  // Verify the user who clicked is the same user who started the command
  const customIdParts = interaction.customId.split("_");
  const faction = customIdParts[1] as Faction;
  const expectedUserId = customIdParts[2];

  if (interaction.user.id !== expectedUserId) {
    const embed = errorEmbed("This registration is not for you!");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const race = interaction.values[0];
  if (!race || !faction) return;
  await registerUser(interaction, faction, race as Race);
};

import { MessageFlags, StringSelectMenuInteraction } from "discord.js";
import { raceRegister } from "../raceRegister";
import { Faction } from "../../../types";
import { errorEmbed } from "../errorEmbed";

export const execute = async (interaction: StringSelectMenuInteraction) => {
  // Verify the user who clicked is the same user who started the command
  const customIdParts = interaction.customId.split("_");
  const expectedUserId = customIdParts[1];

  if (interaction.user.id !== expectedUserId) {
    const embed = errorEmbed("This registration is not for you!");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const faction = interaction.values[0];
  await raceRegister(interaction, faction as Faction);
};

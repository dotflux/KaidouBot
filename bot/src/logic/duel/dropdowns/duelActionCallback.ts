import {
  StringSelectMenuInteraction,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { errorEmbed } from "../../register/errorEmbed";
import { duelActionFs } from "./duelActionFs";

export const execute = async (interaction: StringSelectMenuInteraction) => {
  const customIdParts = interaction.customId.split("_");
  const duelId = customIdParts[1];
  const [challenger, opponent] = duelId.split(":");
  if (interaction.user.id !== challenger && interaction.user.id !== opponent) {
    const embed = errorEmbed("This registration is not for you!");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const action = interaction.values[0];
  if (action === "fighting_style") {
    await interaction.reply({
      content: "Pick your move",
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          duelActionFs.setCustomId(
            `duelActionFs_${duelId}_${interaction.user.id}`
          )
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }
};

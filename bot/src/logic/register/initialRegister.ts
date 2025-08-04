import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { createInitialRegisterEmbed } from "./embeds/initialRegisterEmbed";
import { factionSelect } from "./dropdowns/registerFactionDropdown";

export const initialRegister = async (
  interaction: ChatInputCommandInteraction
) => {
  const initialEmbed = createInitialRegisterEmbed(interaction.user.username);
  const factionSelectWithUser = factionSelect.setCustomId(
    `factionSelect_${interaction.user.id}`
  );
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    factionSelectWithUser
  );
  await interaction.reply({ embeds: [initialEmbed], components: [row] });
};

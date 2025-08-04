import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { raceSelect } from "./dropdowns/registerRaceDropdown";
import { raceRegisterEmbed } from "./embeds/raceRegisterEmbed";
import { errorEmbed } from "./errorEmbed";
import { Faction } from "../../types";

export const raceRegister = async (
  interaction: StringSelectMenuInteraction,
  faction: Faction
) => {
  if (!faction) {
    const embed = errorEmbed("You did not pick a faction");
    await interaction.update({
      embeds: [embed],
      components: [],
    });
    return;
  }

  const embed = raceRegisterEmbed();
  const raceSelectWithFaction = raceSelect.setCustomId(
    `raceSelect_${faction}_${interaction.user.id}`
  );
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    raceSelectWithFaction
  );
  await interaction.update({
    embeds: [embed],
    components: [row],
  });
};

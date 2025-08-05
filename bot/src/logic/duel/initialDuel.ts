import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { User } from "discord.js";
import { initialDuelEmbed } from "./embeds/initialDuelEmbed";

export const initialDuel = async (
  interaction: ChatInputCommandInteraction,
  opponent: User
) => {
  const initialEmbed = initialDuelEmbed(
    interaction.user.username,
    opponent.username
  );

  const acceptButton = new ButtonBuilder()
    .setCustomId(`duelAccept_${interaction.user.id}_${opponent.id}`)
    .setEmoji("<:tick:1402307029825228890>")
    .setStyle(ButtonStyle.Success);

  const rejectButton = new ButtonBuilder()
    .setCustomId(`duelReject_${interaction.user.id}_${opponent.id}`)
    .setLabel("X")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    acceptButton,
    rejectButton
  );

  await interaction.reply({
    content: `<@${opponent.id}>`,
    embeds: [initialEmbed],
    components: [row],
  });
};

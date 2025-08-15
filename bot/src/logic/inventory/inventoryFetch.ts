import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ButtonInteraction,
  MessageFlags,
} from "discord.js";
import { UserModel } from "../../db/models/user";
import { InventoryModel } from "../../db/models/inventory";
import { errorEmbed } from "../register/errorEmbed";
import { inventoryEmbed } from "./embeds/inventoryEmbed";
import { capitalize, humanize } from "../emojis/capitalize";

const PAGE_SIZE = 5;
const BUTTON_TIMEOUT_MS = 5 * 60 * 1000;

export const inventoryFetch = async (
  interaction: ChatInputCommandInteraction,
  type: string
) => {
  try {
    const user = await UserModel.findOne({ userId: interaction.user.id });
    if (!user) {
      const err = errorEmbed("User not found!");
      await interaction.reply({ embeds: [err], flags: MessageFlags.Ephemeral });
      return;
    }

    const inventory = await InventoryModel.findOne({
      userId: interaction.user.id,
    });
    if (!inventory) {
      const err = errorEmbed("Inventory not found!");
      await interaction.reply({ embeds: [err], flags: MessageFlags.Ephemeral });
      return;
    }

    const itemsRaw =
      inventory.items instanceof Map
        ? Object.fromEntries(inventory.items as any)
        : (inventory.items as any) || {};

    const collectionRaw = itemsRaw[type] || {};
    const entries = Object.entries(collectionRaw).map(
      ([key, val]: [string, any]) => {
        const quantity = (val && (val.quantity ?? val.qty ?? 0)) ?? 0;
        const rarity = capitalize(val?.rarity) ?? "Common";
        const displayName = humanize(val?.data?.displayName) ?? humanize(key);
        return { key, displayName, quantity, rarity, raw: val };
      }
    );

    if (!entries.length) {
      const embed = inventoryEmbed(interaction.user.username, type)
        .setDescription(`You have no ${type}`)
        .setTimestamp();
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
    let page = 0;

    const makeEmbedForPage = (p: number) => {
      const start = p * PAGE_SIZE;
      const slice = entries.slice(start, start + PAGE_SIZE);
      const embed = inventoryEmbed(interaction.user.username, type)
        .setDescription(`Page ${p + 1}/${totalPages}`)
        .setTimestamp();

      for (const item of slice) {
        const value = `Quantity: **${item.quantity}**\nRarity: **${item.rarity}**\nKey: \`${item.key}\``;
        embed.addFields({ name: `${item.displayName}`, value, inline: false });
      }

      return embed;
    };

    const makeButtons = (p: number) => {
      const prev = new ButtonBuilder()
        .setCustomId(`inv_prev_${interaction.id}`)
        .setLabel("<")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(p <= 0);

      const next = new ButtonBuilder()
        .setCustomId(`inv_next_${interaction.id}`)
        .setLabel(">")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(p >= totalPages - 1);

      return new ActionRowBuilder<ButtonBuilder>().addComponents(prev, next);
    };

    await interaction.reply({
      embeds: [makeEmbedForPage(page)],
      components: [makeButtons(page)],
    });

    const reply =
      (await interaction.fetchReply()) as import("discord.js").Message<boolean>;

    const collector = (reply as any).createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: BUTTON_TIMEOUT_MS,
      filter: (i: ButtonInteraction) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (btn: ButtonInteraction) => {
      await btn.deferUpdate();
      if (btn.customId === `inv_prev_${interaction.id}`) {
        page = Math.max(0, page - 1);
      } else if (btn.customId === `inv_next_${interaction.id}`) {
        page = Math.min(totalPages - 1, page + 1);
      }
      await btn.editReply({
        embeds: [makeEmbedForPage(page)],
        components: [makeButtons(page)],
      });
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`inv_prev_${interaction.id}`)
          .setLabel("<")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`inv_next_${interaction.id}`)
          .setLabel(">")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      );
      try {
        await (reply as any).edit({ components: [disabledRow] });
      } catch (e) {}
    });
  } catch (err) {
    console.error(err);
  }
};

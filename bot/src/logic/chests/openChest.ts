import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { UserModel } from "../../db/models/user";
import { errorEmbed } from "../register/errorEmbed";
import { RARITIES, Rarity, DEVIL_FRUITS, SWORDS, GUNS } from "../../types";
import { rewardChest } from "./rewardChest";
import {
  InventoryModel,
  findItemInInventory,
  addItemToInventory,
  makeItemKey,
  removeItemFromInventory,
} from "../../db/models/inventory";
import { chestOpenedEmbed } from "./embeds/chestOpenedEmbed";

function classifyItem(name: string): string {
  const key = makeItemKey(name);
  if (DEVIL_FRUITS.has(key)) return "devilFruit";
  if (SWORDS.has(key)) return "swords";
  if (GUNS.has(key)) return "guns";
  return "misc";
}

export const openChest = async (
  interaction: ChatInputCommandInteraction,
  type: Rarity
) => {
  try {
    const user = await UserModel.findOne({ userId: interaction.user.id });
    if (!user) {
      const error = errorEmbed("User not in database");
      await interaction.reply({
        embeds: [error],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (!RARITIES.includes(type)) {
      const error = errorEmbed("Invalid chest type mentioned");
      await interaction.reply({
        embeds: [error],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const inventory = await InventoryModel.findOne({
      userId: interaction.user.id,
    });
    if (!inventory) {
      const error = errorEmbed("Inventory not in database");
      await interaction.reply({
        embeds: [error],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const exists = await findItemInInventory(
      interaction.user.id,
      "chest",
      type
    );
    if (!exists.ok) {
      const error = errorEmbed(`You don't have that chest`);
      await interaction.reply({
        embeds: [error],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const dec = await removeItemFromInventory(
      interaction.user.id,
      "chest",
      type,
      1
    );
    if (!dec.ok) {
      const error = errorEmbed(`Something went wrong`);
      await interaction.reply({
        embeds: [error],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const rewards = await rewardChest(type);

    await UserModel.updateOne(
      { userId: interaction.user.id },
      { $inc: { money: rewards.belli, gems: rewards.gems ?? 0 } }
    );

    const addPromises = rewards.items.map(async (itemName) => {
      const itemType = classifyItem(itemName);
      await addItemToInventory(
        interaction.user.id,
        itemType,
        itemName,
        type,
        1
      );
      return { name: itemName, type: itemType };
    });

    await Promise.all(addPromises);

    const embed = chestOpenedEmbed(
      interaction.user.username,
      type,
      rewards.items,
      rewards.belli,
      rewards.gems
    );

    await interaction.reply({
      embeds: [embed],
    });
  } catch (error) {
    console.log(error);
  }
};

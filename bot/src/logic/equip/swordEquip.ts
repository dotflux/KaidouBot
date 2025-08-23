import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { UserModel } from "../../db/models/user";
import { errorEmbed } from "../register/errorEmbed";
import {
  InventoryModel,
  findItemInInventory,
  removeItemFromInventory,
  makeItemKey,
  addItemToInventory,
} from "../../db/models/inventory";
import { Rarity } from "../../types";

export const swordEquip = async (
  interaction: ChatInputCommandInteraction,
  name: string
) => {
  try {
    const user = await UserModel.findOne({ userId: interaction.user.id });
    if (!user) {
      const error = errorEmbed("User not found!");
      await interaction.editReply({ embeds: [error] });
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

    const itemLookup = await findItemInInventory(
      interaction.user.id,
      "swords",
      name
    );
    if (!itemLookup.ok) {
      const err = errorEmbed(`You don't have that item`);
      await interaction.reply({ embeds: [err], flags: MessageFlags.Ephemeral });
      return;
    }

    const { itemKey, item } = itemLookup;
    if (item.quantity <= 0) {
      const err = errorEmbed(`You don't have that item`);
      await interaction.reply({ embeds: [err], flags: MessageFlags.Ephemeral });
      return;
    }

    const currentlyEquipped = user.equippedWeapon ?? "";

    if (currentlyEquipped && makeItemKey(currentlyEquipped) === itemKey) {
      const err = errorEmbed(
        `You already have ${item.data?.displayName} equipped`
      );
      await interaction.reply({ embeds: [err], flags: MessageFlags.Ephemeral });
      return;
    }

    const dec = await removeItemFromInventory(
      interaction.user.id,
      "swords",
      name,
      1
    );
    if (!dec.ok) {
      const err = errorEmbed(`Failed to equip the weapon`);
      await interaction.reply({ embeds: [err], flags: MessageFlags.Ephemeral });
      return;
    }

    if (currentlyEquipped) {
      await addItemToInventory(
        interaction.user.id,
        "swords",
        currentlyEquipped,
        item.rarity as Rarity,
        1
      );
    }

    await UserModel.updateOne(
      { userId: interaction.user.id },
      { $set: { equippedWeapon: itemKey } }
    );

    await interaction.reply({
      content: `Successfully equipped ${name}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.log(error);
  }
};

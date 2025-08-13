import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { UserModel } from "../../db/models/user";
import { InventoryModel, addItemToInventory } from "../../db/models/inventory";

export const itemCheat = async (
  interaction: ChatInputCommandInteraction,
  type: string,
  name: string,
  rarity: "common" | "rare" | "epic" | "legendary",
  quantity: number
) => {
  const user = await UserModel.findOne({ userId: interaction.user.id });
  if (!user) {
    await interaction.reply({
      content: "User not in database",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const inventory = await InventoryModel.findOne({
    userId: interaction.user.id,
  });
  if (!inventory) {
    await interaction.reply({
      content: "Inventory not in database",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const newQty = await addItemToInventory(
    interaction.user.id,
    type,
    name,
    rarity,
    quantity
  );

  await interaction.reply({
    content: `Added ${quantity} × ${name} (rarity: ${rarity}). New quantity: ${newQty}`,
    flags: MessageFlags.Ephemeral,
  });
};

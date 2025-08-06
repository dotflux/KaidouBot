import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export const duelActionSelect = new StringSelectMenuBuilder()
  .setCustomId("duelActionSelect")
  .setPlaceholder("Select your action")
  .setMinValues(1)
  .setMaxValues(1)
  .addOptions(
    new StringSelectMenuOptionBuilder()
      .setLabel("Fighting Style")
      .setValue("fighting_style")
      .setDescription("Use your fighting style"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Forfeit")
      .setValue("forfeit")
      .setDescription("Forfeit from this battle")
  );

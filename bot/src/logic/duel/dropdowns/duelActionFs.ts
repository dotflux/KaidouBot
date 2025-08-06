import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export const duelActionFs = new StringSelectMenuBuilder()
  .setCustomId("duelActionFs")
  .setPlaceholder("Select your move")
  .setMinValues(1)
  .setMaxValues(1)
  .addOptions(
    new StringSelectMenuOptionBuilder()
      .setLabel("Punch")
      .setValue("punch")
      .setDescription("Punch your opp fr"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Defend")
      .setValue("defend")
      .setDescription("Defend yourself from opp ong")
  );

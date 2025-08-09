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
      .setLabel("Devil Fruit")
      .setValue("devil_fruit")
      .setDescription("Use your devil fruit ability"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Rokushiki")
      .setValue("rokushiki")
      .setDescription("Use your 6 techniques"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Weapon")
      .setValue("weapon")
      .setDescription("Use your weapon"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Transformation")
      .setValue("transformation")
      .setDescription("Use "),
    new StringSelectMenuOptionBuilder()
      .setLabel("Forfeit")
      .setValue("forfeit")
      .setDescription("Forfeit from this battle")
  );

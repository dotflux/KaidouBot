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
      .setEmoji("<:fs:1404408553153757206>")
      .setDescription("Use your fighting style"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Devil Fruit")
      .setValue("devil_fruit")
      .setEmoji("<:df:1404407694068023399>")
      .setDescription("Use your devil fruit ability"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Rokushiki")
      .setValue("rokushiki")
      .setEmoji("<:rokushiki:1404408123543912458>")
      .setDescription("Use your 6 techniques"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Weapon")
      .setValue("weapon")
      .setEmoji("<:weapon:1404407206174134302>")
      .setDescription("Use your weapon"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Transformation")
      .setValue("transformation")
      .setEmoji("<:transformation:1404409699776069632>")
      .setDescription("Use your transformed moves"),
    new StringSelectMenuOptionBuilder()
      .setLabel("Forfeit")
      .setValue("forfeit")
      .setEmoji("<:forfeit:1404405064365244476>")
      .setDescription("Forfeit from this battle")
  );

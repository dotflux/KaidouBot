import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { raceEmojis } from "../../emojis/raceEmojis";

export const raceSelect = new StringSelectMenuBuilder()
  .setCustomId("raceSelect")
  .setPlaceholder("Select your race")
  .setMinValues(1)
  .setMaxValues(1)
  .addOptions(
    new StringSelectMenuOptionBuilder()
      .setLabel("Mink")
      .setValue("mink")
      .setDescription("Start as a mink")
      .setEmoji(raceEmojis("mink")),
    new StringSelectMenuOptionBuilder()
      .setLabel("Cyborg")
      .setValue("cyborg")
      .setDescription("Start as a cyborg")
      .setEmoji(raceEmojis("cyborg")),
    new StringSelectMenuOptionBuilder()
      .setLabel("Fishman")
      .setValue("fishman")
      .setDescription("Start as a fishman")
      .setEmoji(raceEmojis("fishman")),
    new StringSelectMenuOptionBuilder()
      .setLabel("Human")
      .setValue("human")
      .setDescription("Start as a human")
      .setEmoji(raceEmojis("human"))
  );

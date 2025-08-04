import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { factionEmojis } from "../../emojis/factionEmojis";

export const factionSelect = new StringSelectMenuBuilder()
  .setCustomId("factionSelect")
  .setPlaceholder("Select your faction")
  .setMinValues(1)
  .setMaxValues(1)
  .addOptions(
    new StringSelectMenuOptionBuilder()
      .setLabel("Pirate")
      .setValue("pirate")
      .setDescription("Start as a pirate")
      .setEmoji(factionEmojis("pirate")),
    new StringSelectMenuOptionBuilder()
      .setLabel("Marine")
      .setValue("marine")
      .setDescription("Start as a marine")
      .setEmoji(factionEmojis("marine")),
    new StringSelectMenuOptionBuilder()
      .setLabel("Revolutionary Army")
      .setValue("ra")
      .setDescription("Start as a member of the revolutionary army")
      .setEmoji(factionEmojis("ra")),
    new StringSelectMenuOptionBuilder()
      .setLabel("Bounty Hunter")
      .setValue("bh")
      .setDescription("Start as a bounty hunter")
      .setEmoji(factionEmojis("bh"))
  );

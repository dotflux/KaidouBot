import { EmbedBuilder } from "discord.js";
import { inventoryThumbnailEmojis } from "../../emojis/inventoryThumbnailEmojis";
import { capitalize } from "../../emojis/capitalize";

export const inventoryEmbed = (username: string, type: string) => {
  const embed = new EmbedBuilder()
    .setTitle(`**${username}**'s **${capitalize(type)}** Inventory`)
    .setColor("DarkPurple");
  const thumb = inventoryThumbnailEmojis(type);
  if (thumb) embed.setThumbnail(thumb);
  embed.setTimestamp();

  return embed;
};

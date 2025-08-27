import { EmbedBuilder } from "discord.js";
import { humanize } from "../../emojis/capitalize";

export const chestOpenedEmbed = (
  username: string,
  rarity: string,
  items: any[],
  belli: number,
  gems: number
) => {
  const list = (items || []).map((it: any) => {
    if (typeof it === "string") return `• ${humanize(it)}`;
    if (it?.displayName) return `• ${it.displayName}`;
    if (it?.name) return `• ${humanize(it.name)}`;
    return `• ${String(it)}`;
  });

  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle(`${username} opened a chest`)
    .setDescription(
      `**${username}**, You opened a **${humanize(
        rarity
      )} Chest**. Your rewards are:`
    )
    .addFields(
      {
        name: "Items",
        value: list.length ? list.join("\n") : "None",
        inline: false,
      },
      {
        name: "Belli",
        value: `<:belli:1404425845363445770> **${belli}**`,
        inline: true,
      },
      ...(gems && gems > 0
        ? [{ name: "Gems", value: `:gem: **${gems}**`, inline: true }]
        : [])
    )
    .setThumbnail("https://cdn.discordapp.com/emojis/1405939671338455170.png")
    .setTimestamp();

  return embed;
};

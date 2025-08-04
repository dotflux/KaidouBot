import { EmbedBuilder } from "discord.js";

export const errorEmbed = (description: string) => {
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("ERROR!")
    .setDescription(`${description}`)
    .setTimestamp();

  return embed;
};

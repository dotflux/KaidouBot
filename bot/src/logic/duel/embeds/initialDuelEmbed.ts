import { EmbedBuilder } from "discord.js";

export const initialDuelEmbed = (user: string, opponent: string) => {
  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle("CHALLENGE")
    .setDescription(
      `**${opponent}**, You have been challenged by **${user}** to a duel. Do you want to accept the duel?`
    )
    .setTimestamp()
    .setImage(
      "https://i.ibb.co/LYx74sG/tumblr-b84e4d0cffe2c133dcb05b04b102cec6-8b435e3f-540.gif"
    );

  return embed;
};

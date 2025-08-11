import { EmbedBuilder } from "discord.js";

export const duelLoadingEmbed = () => {
  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle("Creating Battlefield..")
    .setDescription(
      `Challenger's request has been accepted, wait a moment the battlefield is in creation...`
    )
    .setTimestamp()
    .setImage(
      "https://cdn.dribbble.com/users/107759/screenshots/3649017/skull3.gif"
    );

  return embed;
};

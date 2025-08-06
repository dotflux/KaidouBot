import { EmbedBuilder } from "discord.js";

export const duelStartedEmbed = (
  user: string,
  opponent: string,
  hp: { challenger: Number; opponent: Number }
) => {
  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle("Duel Accepted")
    .setDescription(
      `**${opponent}**, Accepted the duel request sent by **${user}**. The duel has been started`
    )
    .setFields(
      {
        name: `${user}`,
        value: `HP: ${hp.challenger}`,
      },
      {
        name: `${opponent}`,
        value: `HP: ${hp.opponent}`,
      }
    )
    .setTimestamp();

  return embed;
};

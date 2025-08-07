import { EmbedBuilder } from "discord.js";
import { generateHpBar } from "../../emojis/generateHpBar";

export const duelStartedEmbed = (
  user: string,
  opponent: string,
  hp: { challenger: number; opponent: number }
) => {
  const challengerHpBar = generateHpBar(hp.challenger, hp.challenger);
  const opponentHpBar = generateHpBar(hp.opponent, hp.opponent);
  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle("Duel Accepted")
    .setDescription(
      `**${opponent}**, Accepted the duel request sent by **${user}**. The duel has been started`
    )
    .setFields(
      {
        name: `${user}`,
        value: `**HP:** ${hp.challenger}\n${challengerHpBar}`,
      },
      {
        name: `${opponent}`,
        value: `**HP:** ${hp.opponent}\n${opponentHpBar}`,
      },
      {
        name: "Outcome:",
        value: "The duel has been started, FIGHT!",
      }
    )
    .setTimestamp();

  return embed;
};

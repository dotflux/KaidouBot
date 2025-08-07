import { EmbedBuilder } from "discord.js";
import { generateHpBar } from "../../emojis/generateHpBar";

export const duelProcessedEmbed = (
  user: string,
  opponent: string,
  hp: { challenger: number; opponent: number },
  maxHp: { challenger: number; opponent: number },
  moveUsed: { challenger: string; opponent: string },
  currentTurn: number,
  message: string
) => {
  const challengerHpBar = generateHpBar(hp.challenger, maxHp.challenger);
  const opponentHpBar = generateHpBar(hp.opponent, maxHp.opponent);
  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle(`Duel Turn: ${currentTurn}`)
    .setDescription(`Both players have used their moves`)
    .setFields(
      {
        name: `${user}`,
        value: `**HP:** ${hp.challenger}\n${challengerHpBar}\n**Move:** ${moveUsed.challenger}`,
      },
      {
        name: `${opponent}`,
        value: `**HP:** ${hp.opponent}\n${opponentHpBar}\n**Move:** ${moveUsed.opponent}`,
      },
      {
        name: "Outcome:",
        value: message,
      }
    )
    .setTimestamp();

  return embed;
};

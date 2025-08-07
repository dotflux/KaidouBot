import { EmbedBuilder } from "discord.js";
import { generateHpBar } from "../../emojis/generateHpBar";

export const duelWonEmbed = (
  challenger: string,
  opponent: string,
  winner: string,
  hp: { challenger: number; opponent: number },
  maxHp: { challenger: number; opponent: number },
  moveUsed: { challenger: string; opponent: string },
  message: string
) => {
  const challengerHpBar = generateHpBar(hp.challenger, maxHp.challenger);
  const opponentHpBar = generateHpBar(hp.opponent, maxHp.opponent);
  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle(`${winner} won this duel!`)
    .setDescription(`So the winner takes it all...`)
    .setFields(
      {
        name: `${
          winner === challenger ? "<:victory_crown:1403007931544506494> " : ""
        }${challenger}`,
        value: `**HP:** ${hp.challenger}\n${challengerHpBar}\n**Move:** ${moveUsed.challenger}`,
      },
      {
        name: `${
          winner === opponent ? "<:victory_crown:1403007931544506494> " : ""
        }${opponent}`,
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

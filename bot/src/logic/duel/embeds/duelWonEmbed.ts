import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { generateHpBar } from "../../emojis/generateHpBar";
import sharp from "sharp";
import { generateDefBar } from "../../emojis/generateDefBar";

export const duelWonEmbed = async (
  challenger: string,
  opponent: string,
  base64Image: string,
  winner: string,
  hp: { challenger: number; opponent: number },
  maxHp: { challenger: number; opponent: number },
  def: { challenger: number; opponent: number },
  maxDef: { challenger: number; opponent: number },
  moveUsed: { challenger: string; opponent: string },
  message: string
) => {
  const challengerHpBar = generateHpBar(hp.challenger, maxHp.challenger);
  const opponentHpBar = generateHpBar(hp.opponent, maxHp.opponent);
  const challengerDefBar = generateDefBar(def.challenger, maxDef.challenger);
  const opponentDefBar = generateDefBar(def.opponent, maxDef.opponent);

  const imageBuffer = await sharp(Buffer.from(base64Image, "base64"))
    .jpeg({ quality: 70 }) // reduce size
    .toBuffer();
  const attachment = new AttachmentBuilder(imageBuffer, { name: "duel.jpg" });

  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle(`${winner} won this duel!`)
    .setDescription(`So the winner takes it all...`)
    .setFields(
      {
        name: `${
          winner === challenger ? "<:victory_crown:1403007931544506494> " : ""
        }${challenger}`,
        value: `**HP:** ${hp.challenger}\n${challengerHpBar}\n**Defense:** ${def.challenger}\n${challengerDefBar}\n**Move:** ${moveUsed.challenger}`,
      },
      {
        name: `${
          winner === opponent ? "<:victory_crown:1403007931544506494> " : ""
        }${opponent}`,
        value: `**HP:** ${hp.opponent}\n${opponentHpBar}\n**Defense:** ${def.opponent}\n${opponentDefBar}\n**Move:** ${moveUsed.opponent}`,
      },
      {
        name: "Outcome:",
        value: message,
      }
    )
    .setImage("attachment://duel.jpg")
    .setTimestamp();

  return { embed, attachment };
};

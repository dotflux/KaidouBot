import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { generateHpBar } from "../../emojis/generateHpBar";
import { generateDefBar } from "../../emojis/generateDefBar";

export const duelStartedEmbed = (
  user: string,
  opponent: string,
  base64Image: string,
  hp: { challenger: number; opponent: number },
  def: { challenger: number; opponent: number },
  maxDef: { challenger: number; opponent: number }
) => {
  const challengerHpBar = generateHpBar(hp.challenger, hp.challenger);
  const opponentHpBar = generateHpBar(hp.opponent, hp.opponent);
  const challengerDefBar = generateDefBar(def.challenger, maxDef.challenger);
  const opponentDefBar = generateDefBar(def.opponent, maxDef.opponent);

  const imageBuffer = Buffer.from(base64Image, "base64");
  const attachment = new AttachmentBuilder(imageBuffer, { name: "duel.png" });

  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle("Duel Accepted")
    .setDescription(
      `**${opponent}**, Accepted the duel request sent by **${user}**. The duel has been started`
    )
    .setFields(
      {
        name: `${user}`,
        value: `**HP:** ${hp.challenger}\n${challengerHpBar}\n**Defense:** ${def.challenger}\n${challengerDefBar}`,
      },
      {
        name: `${opponent}`,
        value: `**HP:** ${hp.opponent}\n${opponentHpBar}\n**Defense:** ${def.opponent}\n${opponentDefBar}`,
      },
      {
        name: "Outcome:",
        value: "The duel has been started, FIGHT!",
      }
    )
    .setImage("attachment://duel.png")
    .setTimestamp();

  return { embed, attachment };
};

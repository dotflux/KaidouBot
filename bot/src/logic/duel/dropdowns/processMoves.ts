import {
  StringSelectMenuInteraction,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { errorEmbed } from "../../register/errorEmbed";
import redisClient from "../../../db/redis";
import { Move } from "../../../types";
import { duelActionSelect } from "./duelActionSelect";

const DAMAGE = 100;

const moveTypes: Record<string, Move> = {
  punch: "offense",
  defend: "defense",
};

export const processMoves = async (
  interaction: StringSelectMenuInteraction,
  opponentId: string,
  challengerMove: string,
  opponentMove: string
) => {
  const customIdParts = interaction.customId.split("_");
  const challengerId = interaction.user.id;

  const duelId = customIdParts[1];

  const challengerHpKey = `${challengerId}:hp`;
  const opponentHpKey = `${opponentId}:hp`;

  const [challengerHpRaw, opponentHpRaw] = await redisClient.hmGet(
    `duel:${duelId}`,
    [challengerHpKey, opponentHpKey]
  );

  let challengerHp = Number(challengerHpRaw);
  let opponentHp = Number(opponentHpRaw);

  let message = "";

  const challengerType = moveTypes[challengerMove];
  const opponentType = moveTypes[opponentMove];

  if (!challengerType || !opponentType) {
    await interaction.reply({
      embeds: [errorEmbed("Invalid move type.")],
      ephemeral: true,
    });
    return;
  }

  if (challengerType === "special" || opponentType === "special") {
    await interaction.reply({
      content: `Special moves aren't implemented yet.`,
      ephemeral: true,
    });
    return;
  }

  const matchup = `${challengerType}_vs_${opponentType}` as const;

  switch (matchup) {
    case "offense_vs_offense":
      challengerHp -= DAMAGE;
      opponentHp -= DAMAGE;
      message = `Both used offensive moves! You both took **${DAMAGE}** damage.`;
      break;

    case "offense_vs_defense":
      message = `Your attack was **blocked** by the opponent!`;
      break;

    case "defense_vs_offense":
      message = `You successfully **blocked** the opponent's attack!`;
      break;

    case "defense_vs_defense":
      message = `Both players **defended**. Nothing happened.`;
      break;

    default:
      message = `Unexpected matchup: ${matchup}`;
  }

  await redisClient.hSet(`duel:${duelId}`, {
    [challengerHpKey]: Math.max(0, challengerHp),
    [opponentHpKey]: Math.max(0, opponentHp),
    [`${challengerId}:moveUsed`]: "",
    [`${opponentId}:moveUsed`]: "",
  });

  const isChallengerDead = challengerHp <= 0;
  const isOpponentDead = opponentHp <= 0;
  const areBothDead = challengerHp <= 0 && opponentHp <= 0;

  if (areBothDead) {
    await redisClient.del(`duel:${duelId}`);

    await interaction.reply({
      content: `DRAW!!\n\nFinal HP:\n<@${challengerId}>: ${challengerHp}\n<@${opponentId}>: ${opponentHp}`,
      components: [],
    });
    return;
  }

  if (isChallengerDead || isOpponentDead) {
    const winnerId = isChallengerDead ? opponentId : challengerId;
    const loserId = isChallengerDead ? challengerId : opponentId;
    await redisClient.del(`duel:${duelId}`);

    await interaction.reply({
      content: `💀 <@${loserId}> has been defeated! <@${winnerId}> wins the duel!\n\nFinal HP:\n<@${challengerId}>: ${challengerHp}\n<@${opponentId}>: ${opponentHp}`,
      components: [],
    });
    return;
  }

  await interaction.reply({
    content: `${message}\n\n<@${challengerId}> HP: ${challengerHp} | <@${opponentId}> HP: ${opponentHp}`,
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        duelActionSelect.setCustomId(`duelActionSelect_${duelId}`)
      ),
    ],
  });
};

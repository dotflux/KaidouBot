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
import fsMoves from "../../../moves/fsMoves.json";
import { DuelModel } from "../../../db/models/duel";
import { duelProcessedEmbed } from "../embeds/duelProcessedEmbed";
import { duelWonEmbed } from "../embeds/duelWonEmbed";
import { duelDrawEmbed } from "../embeds/duelDrawEmbed";

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

  const challengerMaxHpKey = `${challengerId}:maxHp`;
  const opponentMaxHpKey = `${opponentId}:maxHp`;

  const [challengerHpRaw, opponentHpRaw] = await redisClient.hmGet(
    `duel:${duelId}`,
    [challengerHpKey, opponentHpKey]
  );
  const [challengerMaxHpRaw, opponentMaxHpRaw] = await redisClient.hmGet(
    `duel:${duelId}`,
    [challengerMaxHpKey, opponentMaxHpKey]
  );

  const [currentTurnRaw] = await redisClient.hmGet(
    `duel:${duelId}`,
    "currentTurn"
  );
  let currentTurn = Number(currentTurnRaw);

  let challengerHp = Number(challengerHpRaw);
  let opponentHp = Number(opponentHpRaw);

  const challengerMaxHp = Number(challengerMaxHpRaw);
  const opponentMaxHp = Number(opponentMaxHpRaw);

  const challengerData = await interaction.client.users.fetch(challengerId);
  const opponentData = await interaction.client.users.fetch(opponentId);
  const challengerUsername = challengerData.username;
  const opponentUsername = opponentData.username;

  const challengerMoveData = Object.values(fsMoves)
    .flat()
    .find((m) => m.name === challengerMove);
  const opponentMoveData = Object.values(fsMoves)
    .flat()
    .find((m) => m.name === opponentMove);

  if (!challengerMoveData || !opponentMoveData) {
    await interaction.reply({
      embeds: [errorEmbed("Invalid move type.")],
      ephemeral: true,
    });
    return;
  }

  const challengerType = challengerMoveData.type;
  const opponentType = opponentMoveData.type;

  if (challengerType === "special" || opponentType === "special") {
    await interaction.reply({
      content: `Special moves aren't implemented yet.`,
      ephemeral: true,
    });
    return;
  }

  let message = "";

  const matchup = `${challengerType}_vs_${opponentType}` as const;

  switch (matchup) {
    case "offense_vs_offense": {
      const damage1 = challengerMoveData.power;
      const damage2 = opponentMoveData.power;
      challengerHp -= damage2;
      opponentHp -= damage1;
      message = `${challengerData.username} took ${damage2} damage and ${opponentData.username} took ${damage1} damage! `;
      break;
    }
    case "offense_vs_defense": {
      const damage3 = Math.max(
        0,
        challengerMoveData.power - opponentMoveData.power
      );
      opponentHp -= damage3;
      message = `${challengerUsername} attacked, but ${opponentUsername} defended and took ${damage3} damage!`;
      break;
    }
    case "defense_vs_offense": {
      const damage4 = Math.max(
        0,
        opponentMoveData.power - challengerMoveData.power
      );
      challengerHp -= damage4;
      message = `${opponentUsername} attacked, but ${challengerUsername} defended and took ${damage4} damage!`;
      break;
    }
    case "defense_vs_defense": {
      message = `${challengerUsername} and ${opponentUsername} both defended. Nothing happened.`;
      break;
    }
    default: {
      message = `Unexpected matchup: ${matchup}`;
    }
  }

  currentTurn += 1;

  await redisClient.hSet(`duel:${duelId}`, {
    [challengerHpKey]: Math.max(0, challengerHp),
    [opponentHpKey]: Math.max(0, opponentHp),
    [`${challengerId}:moveUsed`]: "",
    [`${opponentId}:moveUsed`]: "",
    currentTurn,
  });

  const isChallengerDead = challengerHp <= 0;
  const isOpponentDead = opponentHp <= 0;
  const areBothDead = isChallengerDead && isOpponentDead;

  if (areBothDead) {
    await redisClient.del(`duel:${duelId}`);
    await DuelModel.deleteOne({
      users: { $all: [challengerData.id, opponentData.id] },
    });
    const drawEmbed = duelDrawEmbed(
      challengerUsername,
      opponentUsername,
      { challenger: challengerHp, opponent: opponentHp },
      { challenger: challengerMaxHp, opponent: opponentMaxHp },
      { challenger: challengerMove, opponent: opponentMove },
      `The duel was a draw between the challenger: ${challengerUsername} and the foe: ${opponentUsername}`
    );
    await interaction.reply({
      embeds: [drawEmbed],
      components: [],
    });
    return;
  }

  if (isChallengerDead || isOpponentDead) {
    const winnerUsername = isChallengerDead
      ? opponentUsername
      : challengerUsername;
    const loserUsername = isChallengerDead
      ? challengerUsername
      : opponentUsername;
    await redisClient.del(`duel:${duelId}`);
    await DuelModel.deleteOne({
      users: { $all: [challengerData.id, opponentData.id] },
    });

    const wonEmbed = duelWonEmbed(
      challengerUsername,
      opponentUsername,
      winnerUsername,
      { challenger: challengerHp, opponent: opponentHp },
      { challenger: challengerMaxHp, opponent: opponentMaxHp },
      { challenger: challengerMove, opponent: opponentMove },
      `The duel has been concluded and the winner is ${winnerUsername}`
    );
    await interaction.reply({
      embeds: [wonEmbed],
      components: [],
    });
    return;
  }

  const processedEmbed = duelProcessedEmbed(
    challengerUsername,
    opponentUsername,
    { challenger: challengerHp, opponent: opponentHp },
    { challenger: challengerMaxHp, opponent: opponentMaxHp },
    { challenger: challengerMove, opponent: opponentMove },
    currentTurn,
    message
  );

  await interaction.reply({
    embeds: [processedEmbed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        duelActionSelect.setCustomId(`duelActionSelect_${duelId}`)
      ),
    ],
  });
};

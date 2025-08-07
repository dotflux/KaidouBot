import {
  StringSelectMenuInteraction,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { errorEmbed } from "../../register/errorEmbed";
import redisClient from "../../../db/redis";
import { processMoves } from "./processMoves";
import { DuelModel } from "../../../db/models/duel";

export const execute = async (interaction: StringSelectMenuInteraction) => {
  const customIdParts = interaction.customId.split("_");
  const duelId = customIdParts[1];
  const [challenger, opponent] = duelId.split(":");
  if (interaction.user.id !== challenger && interaction.user.id !== opponent) {
    const embed = errorEmbed("This fight is not yours to fight!");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const duel = await DuelModel.findOne({
    users: { $all: [challenger, opponent] },
  });
  if (!duel) {
    const embed = errorEmbed("This duel does not exist");
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const move = interaction.values[0];

  const userKey = `${interaction.user.id}:moveUsed`;

  const challengerMove = await redisClient.hGet(
    `duel:${duelId}`,
    `${interaction.user.id}:moveUsed`
  );

  if (challengerMove) {
    await interaction.update({
      content: `You have already used a move`,
      components: [],
    });
    return;
  }

  await redisClient.hSet(`duel:${duelId}`, {
    [userKey]: move,
  });

  const opponentId =
    (await redisClient.hGet(`duel:${duelId}`, "challengerId")) ===
    interaction.user.id
      ? await redisClient.hGet(`duel:${duelId}`, "opponentId")
      : await redisClient.hGet(`duel:${duelId}`, "challengerId");

  if (!opponentId) {
    await interaction.update({
      content: `Something went wrong..`,
      components: [],
    });
    return;
  }

  const opponentMove = await redisClient.hGet(
    `duel:${duelId}`,
    `${opponentId}:moveUsed`
  );

  if (!opponentMove) {
    await interaction.update({
      content: `You used **${move}**. Waiting for your opponent....`,
      components: [],
    });
    return;
  }

  await processMoves(interaction, opponentId, move, opponentMove);
};

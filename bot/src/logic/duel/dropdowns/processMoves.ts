import {
  StringSelectMenuInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import redisClient from "../../../db/redis";
import { DuelModel } from "../../../db/models/duel";
import { duelProcessedEmbed } from "../embeds/duelProcessedEmbed";
import { duelDrawEmbed } from "../embeds/duelDrawEmbed";
import { duelWonEmbed } from "../embeds/duelWonEmbed";
import { moveHandlers } from "../handlers";
import { PlayerState, MoveData } from "../moves";
import fsMoves from "../../../moves/fsMoves.json";
import { duelActionSelect } from "./duelActionSelect";

export const processMoves = async (
  interaction: StringSelectMenuInteraction,
  opponentId: string,
  challengerMove: string,
  opponentMove: string,
  backgroundImage: string
) => {
  const [, duelId] = interaction.customId.split("_");
  const challengerId = interaction.user.id;
  const duel = await DuelModel.findOne({
    users: { $all: [challengerId, opponentId] },
  });
  if (!duel) return;

  const keys = [
    `${challengerId}:hp`,
    `${challengerId}:buff_defense`,
    `${challengerId}:buffs`,
    `${challengerId}:debuffs`,
    `${opponentId}:hp`,
    `${opponentId}:buff_defense`,
    `${opponentId}:buffs`,
    `${opponentId}:debuffs`,
    "currentTurn",
    `${challengerId}:maxDef`,
    `${opponentId}:maxDef`,
    `${challengerId}:maxHp`,
    `${opponentId}:maxHp`,
  ];
  const [
    cHpRaw,
    cDefRaw,
    cBuffsRaw,
    cDebuffsRaw,
    oHpRaw,
    oDefRaw,
    oBuffsRaw,
    oDebuffsRaw,
    turnRaw,
    cDefMax,
    oDefMax,
    cHpMax,
    oHpMax,
  ] = await redisClient.hmGet(`duel:${duelId}`, keys);

  const [challengerUser, opponentUser] = await Promise.all([
    interaction.client.users.fetch(challengerId),
    interaction.client.users.fetch(opponentId),
  ]);

  let turn = Number(turnRaw);
  const cState: PlayerState = {
    userId: challengerId,
    username: challengerUser.username,
    hp: Number(cHpRaw),
    maxHp: Number(cHpMax),
    offense: 0,
    defense: 0,
    speed: 0,
    buff_offense: 0,
    buff_defense: Number(cDefRaw),
    buffs: JSON.parse(cBuffsRaw || "{}"),
    debuffs: JSON.parse(cDebuffsRaw || "{}"),
    maxDef: Number(cDefMax),
  };

  const oState: PlayerState = {
    userId: opponentId,
    username: opponentUser.username,
    hp: Number(oHpRaw),
    maxHp: Number(oHpMax),
    offense: 0,
    defense: 0,
    speed: 0,
    buff_offense: 0,
    buff_defense: Number(oDefRaw),
    buffs: JSON.parse(oBuffsRaw || "{}"),
    debuffs: JSON.parse(oDebuffsRaw || "{}"),
    maxDef: Number(oDefMax),
  };

  const lookup = (name: string): MoveData =>
    (Object.values(fsMoves).flat() as MoveData[]).find((m) => m.name === name)!;

  const cMove = lookup(challengerMove);
  const oMove = lookup(opponentMove);

  const cRes = moveHandlers[cMove.type](cState, oState, cMove);
  const oRes = moveHandlers[oMove.type](oState, cState, oMove);

  // HP
  cState.hp += oRes.opponentDelta.hp ?? 0;
  oState.hp += cRes.opponentDelta.hp ?? 0;

  // Defense
  if (oRes.opponentDelta.buff_defense !== undefined)
    cState.buff_defense = oRes.opponentDelta.buff_defense;
  else if (cRes.userDelta.buff_defense !== undefined)
    cState.buff_defense = cRes.userDelta.buff_defense;

  if (cRes.opponentDelta.buff_defense !== undefined)
    oState.buff_defense = cRes.opponentDelta.buff_defense;
  else if (oRes.userDelta.buff_defense !== undefined)
    oState.buff_defense = oRes.userDelta.buff_defense;

  cState.buff_defense = Math.max(0, cState.buff_defense);
  oState.buff_defense = Math.max(0, oState.buff_defense);

  turn += 1;
  await redisClient.hSet(`duel:${duelId}`, {
    [`${challengerId}:hp`]: Math.max(0, cState.hp),
    [`${challengerId}:buff_defense`]: cState.buff_defense,
    [`${challengerId}:buffs`]: JSON.stringify(cState.buffs),
    [`${challengerId}:debuffs`]: JSON.stringify(cState.debuffs),
    [`${opponentId}:hp`]: Math.max(0, oState.hp),
    [`${opponentId}:buff_defense`]: oState.buff_defense,
    [`${opponentId}:buffs`]: JSON.stringify(oState.buffs),
    [`${opponentId}:debuffs`]: JSON.stringify(oState.debuffs),
    currentTurn: turn,
    [`${challengerId}:moveUsed`]: "",
    [`${opponentId}:moveUsed`]: "",
  });

  const deadC = cState.hp <= 0;
  const deadO = oState.hp <= 0;

  if (deadC && deadO) {
    await redisClient.del(`duel:${duelId}`);
    await DuelModel.deleteOne({ users: { $all: [challengerId, opponentId] } });
    const { embed, attachment } = await duelDrawEmbed(
      challengerUser.username,
      opponentUser.username,
      backgroundImage,
      { challenger: cState.hp, opponent: oState.hp },
      { challenger: cState.maxHp, opponent: oState.maxHp },
      { challenger: cState.buff_defense, opponent: oState.buff_defense },
      { challenger: cState.maxDef, opponent: oState.maxDef },
      { challenger: challengerMove, opponent: opponentMove },
      "Draw!"
    );
    return interaction.reply({
      embeds: [embed],
      files: [attachment],
      components: [],
    });
  }

  if (deadC || deadO) {
    await redisClient.del(`duel:${duelId}`);
    await DuelModel.deleteOne({ users: { $all: [challengerId, opponentId] } });
    const winner = deadC ? opponentUser.username : challengerUser.username;
    const { embed, attachment } = await duelWonEmbed(
      challengerUser.username,
      opponentUser.username,
      backgroundImage,
      winner,
      { challenger: cState.hp, opponent: oState.hp },
      { challenger: cState.maxHp, opponent: oState.maxHp },
      { challenger: cState.buff_defense, opponent: oState.buff_defense },
      { challenger: cState.maxDef, opponent: oState.maxDef },
      { challenger: challengerMove, opponent: opponentMove },
      "Win!"
    );
    return interaction.reply({
      embeds: [embed],
      files: [attachment],
      components: [],
    });
  }

  const { embed, attachment } = await duelProcessedEmbed(
    challengerUser.username,
    opponentUser.username,
    backgroundImage,
    { challenger: cState.hp, opponent: oState.hp },
    { challenger: cState.maxHp, opponent: oState.maxHp },
    { challenger: cState.buff_defense, opponent: oState.buff_defense },
    { challenger: cState.maxDef, opponent: oState.maxDef },
    { challenger: challengerMove, opponent: opponentMove },
    turn,
    `${cRes.message}\n${oRes.message}`
  );

  await interaction.reply({
    embeds: [embed],
    files: [attachment],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        duelActionSelect.setCustomId(`duelActionSelect_${duelId}`)
      ),
    ],
  });
};

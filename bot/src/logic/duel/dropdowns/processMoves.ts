import {
  StringSelectMenuInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import redisClient from "../../../db/redis";
import { DuelModel } from "../../../db/models/duel";
import { DuelModel as _DuelModel } from "../../../db/models/duel";
import { duelProcessedEmbed } from "../embeds/duelProcessedEmbed";
import { duelDrawEmbed } from "../embeds/duelDrawEmbed";
import { duelWonEmbed } from "../embeds/duelWonEmbed";
import { moveHandlers } from "../handlers";
import { PlayerState, MoveData } from "../moves";
import fsMoves from "../../../moves/fsMoves.json";
import { duelActionSelect } from "./duelActionSelect";
import { UserModel } from "../../../db/models/user";

const moveMap: Map<string, MoveData> = (() => {
  const m = new Map<string, MoveData>();
  for (const cat of Object.values(fsMoves) as unknown as any[]) {
    for (const mv of cat as any[]) {
      m.set(mv.name, mv as MoveData);
    }
  }
  return m;
})();

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
    `${challengerId}:buff_offense`,
    `${challengerId}:buff_speed`,
    `${challengerId}:buffs`,
    `${challengerId}:debuffs`,
    `${opponentId}:hp`,
    `${opponentId}:buff_defense`,
    `${opponentId}:buff_offense`,
    `${opponentId}:buff_speed`,
    `${opponentId}:buffs`,
    `${opponentId}:debuffs`,
    "currentTurn",
    `${challengerId}:maxDef`,
    `${opponentId}:maxDef`,
    `${challengerId}:maxHp`,
    `${opponentId}:maxHp`,
    `${challengerId}:form`,
    `${opponentId}:form`,
    `${challengerId}:resistance`,
    `${opponentId}:resistance`,
  ];

  const [
    cHpRaw,
    cDefRaw,
    cOffRaw,
    cSpeedRaw,
    cBuffsRaw,
    cDebuffsRaw,
    oHpRaw,
    oDefRaw,
    oOffRaw,
    oSpeedRaw,
    oBuffsRaw,
    oDebuffsRaw,
    turnRaw,
    cDefMax,
    oDefMax,
    cHpMax,
    oHpMax,
    cForm,
    oForm,
    cResistanceRaw,
    oResistanceRaw,
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
    buff_offense: Number(cOffRaw),
    buff_speed: Number(cSpeedRaw),
    buff_defense: Number(cDefRaw),
    buffs: JSON.parse(cBuffsRaw || "{}"),
    debuffs: JSON.parse(cDebuffsRaw || "{}"),
    maxDef: Number(cDefMax),
    form: cForm || "",
    resistance: Number(cResistanceRaw),
  };

  const oState: PlayerState = {
    userId: opponentId,
    username: opponentUser.username,
    hp: Number(oHpRaw),
    maxHp: Number(oHpMax),
    offense: 0,
    defense: 0,
    speed: 0,
    buff_offense: Number(oOffRaw),
    buff_speed: Number(oSpeedRaw),
    buff_defense: Number(oDefRaw),
    buffs: JSON.parse(oBuffsRaw || "{}"),
    debuffs: JSON.parse(oDebuffsRaw || "{}"),
    maxDef: Number(oDefMax),
    form: oForm || "",
    resistance: Number(oResistanceRaw),
  };

  const lookup = (name: string): MoveData => {
    const mv = moveMap.get(name);
    if (!mv) throw new Error(`Move not found: ${name}`);
    return mv;
  };

  const cMove = lookup(challengerMove);
  const oMove = lookup(opponentMove);

  const applyDelta = (target: PlayerState, delta?: Partial<PlayerState>) => {
    if (!delta) return;
    if (delta.maxHp !== undefined) target.maxHp = delta.maxHp;
    if (delta.hp !== undefined) target.hp += delta.hp;
    if (delta.buff_defense !== undefined)
      target.buff_defense = delta.buff_defense;
    if (delta.buff_offense !== undefined)
      target.buff_offense = delta.buff_offense;
    if (delta.buff_speed !== undefined) target.buff_speed = delta.buff_speed;
    if (delta.resistance !== undefined) target.resistance = delta.resistance;
    if ((delta as any).form !== undefined)
      (target as any).form = (delta as any).form;
  };

  const persistStateAndEnd = async (
    reasonWinnerId: string,
    reasonLoserId: string,
    winnerName: string,
    loserName: string,
    winnerIsChallenger: boolean,
    finalMsg: string
  ) => {
    turn += 1;
    await redisClient.hSet(`duel:${duelId}`, {
      [`${challengerId}:hp`]: Math.max(0, cState.hp),
      [`${challengerId}:maxHp`]: cState.maxHp,
      [`${challengerId}:buff_defense`]: cState.buff_defense,
      [`${challengerId}:buff_offense`]: cState.buff_offense,
      [`${challengerId}:buff_speed`]: cState.buff_speed,
      [`${challengerId}:form`]: cState.form,
      [`${challengerId}:buffs`]: JSON.stringify(cState.buffs),
      [`${challengerId}:debuffs`]: JSON.stringify(cState.debuffs),
      [`${opponentId}:hp`]: Math.max(0, oState.hp),
      [`${opponentId}:maxHp`]: oState.maxHp,
      [`${opponentId}:buff_defense`]: oState.buff_defense,
      [`${opponentId}:buff_offense`]: oState.buff_offense,
      [`${opponentId}:buff_speed`]: oState.buff_speed,
      [`${opponentId}:form`]: oState.form,
      [`${opponentId}:buffs`]: JSON.stringify(oState.buffs),
      [`${opponentId}:debuffs`]: JSON.stringify(oState.debuffs),
      currentTurn: turn,
      [`${challengerId}:moveUsed`]: "",
      [`${opponentId}:moveUsed`]: "",
      [`${challengerId}:moveUsed`]: "",
      [`${opponentId}:moveUsed`]: "",
      [`${challengerId}:resistance`]: cState.resistance,
      [`${opponentId}:resistance`]: oState.resistance,
    });
    await redisClient.del(`duel:${duelId}`);
    await DuelModel.deleteOne({ users: { $all: [challengerId, opponentId] } });
    await UserModel.updateOne(
      { userId: reasonWinnerId },
      { $inc: { duelsWon: 1 } }
    );
    await UserModel.updateOne(
      { userId: reasonLoserId },
      { $inc: { duelsLost: 1 } }
    );
    const { embed, attachment } = await duelWonEmbed(
      challengerUser.username,
      opponentUser.username,
      backgroundImage,
      winnerName,
      { challenger: cState.hp, opponent: oState.hp },
      { challenger: cState.maxHp, opponent: oState.maxHp },
      { challenger: cState.buff_defense, opponent: oState.buff_defense },
      { challenger: cState.maxDef, opponent: oState.maxDef },
      { challenger: challengerMove, opponent: opponentMove },
      finalMsg
    );
    return interaction.reply({
      embeds: [embed],
      files: [attachment],
      components: [],
    });
  };

  const cSpeed = cState.buff_speed;
  const oSpeed = oState.buff_speed;
  const challengerFirst =
    cSpeed > oSpeed ? true : cSpeed < oSpeed ? false : Math.random() < 0.5;

  let firstRes, secondRes;

  if (challengerFirst) {
    firstRes = moveHandlers[cMove.type](cState, oState, cMove);
    applyDelta(oState, firstRes.opponentDelta);
    applyDelta(cState, firstRes.userDelta);
    if (oState.hp <= 0) {
      return await persistStateAndEnd(
        challengerId,
        challengerId === opponentId ? challengerId : opponentId,
        challengerUser.username,
        opponentUser.username,
        true,
        `${challengerUser.username} wins!`
      );
    }
    secondRes = moveHandlers[oMove.type](oState, cState, oMove);
    applyDelta(cState, secondRes.opponentDelta);
    applyDelta(oState, secondRes.userDelta);
  } else {
    firstRes = moveHandlers[oMove.type](oState, cState, oMove);
    applyDelta(cState, firstRes.opponentDelta);
    applyDelta(oState, firstRes.userDelta);
    if (cState.hp <= 0) {
      return await persistStateAndEnd(
        opponentId,
        opponentId === challengerId ? opponentId : challengerId,
        opponentUser.username,
        challengerUser.username,
        false,
        `${opponentUser.username} wins!`
      );
    }
    secondRes = moveHandlers[cMove.type](cState, oState, cMove);
    applyDelta(oState, secondRes.opponentDelta);
    applyDelta(cState, secondRes.userDelta);
  }

  cState.buff_defense = Math.max(0, cState.buff_defense);
  oState.buff_defense = Math.max(0, oState.buff_defense);
  cState.hp = Math.min(cState.maxHp, cState.hp);
  oState.hp = Math.min(oState.maxHp, oState.hp);

  turn += 1;
  await redisClient.hSet(`duel:${duelId}`, {
    [`${challengerId}:hp`]: Math.max(0, cState.hp),
    [`${challengerId}:maxHp`]: cState.maxHp,
    [`${challengerId}:buff_defense`]: cState.buff_defense,
    [`${challengerId}:buff_offense`]: cState.buff_offense,
    [`${challengerId}:buff_speed`]: cState.buff_speed,
    [`${challengerId}:form`]: cState.form,
    [`${challengerId}:buffs`]: JSON.stringify(cState.buffs),
    [`${challengerId}:debuffs`]: JSON.stringify(cState.debuffs),
    [`${opponentId}:hp`]: Math.max(0, oState.hp),
    [`${opponentId}:maxHp`]: oState.maxHp,
    [`${opponentId}:buff_defense`]: oState.buff_defense,
    [`${opponentId}:buff_offense`]: oState.buff_offense,
    [`${opponentId}:buff_speed`]: oState.buff_speed,
    [`${opponentId}:form`]: oState.form,
    [`${opponentId}:buffs`]: JSON.stringify(oState.buffs),
    [`${opponentId}:debuffs`]: JSON.stringify(oState.debuffs),
    currentTurn: turn,
    [`${challengerId}:moveUsed`]: "",
    [`${opponentId}:moveUsed`]: "",
    [`${challengerId}:resistance`]: cState.resistance,
    [`${opponentId}:resistance`]: oState.resistance,
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
    const winnerId = deadC ? opponentUser.id : challengerUser.id;
    const loserId = deadC ? challengerUser.id : opponentUser.id;
    const winner = deadC ? opponentUser.username : challengerUser.username;
    const loser = deadC ? challengerUser.username : opponentUser.username;
    await redisClient.del(`duel:${duelId}`);
    await DuelModel.deleteOne({ users: { $all: [challengerId, opponentId] } });
    await UserModel.updateOne({ userId: winnerId }, { $inc: { duelsWon: 1 } });
    await UserModel.updateOne({ userId: loserId }, { $inc: { duelsLost: 1 } });
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
      `The duel has been concluded. ${winner} triumphs over ${loser}.`
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
    `${firstRes?.message ?? ""}\n${secondRes?.message ?? ""}`
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

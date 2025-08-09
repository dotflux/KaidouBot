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
  };

  const lookup = (name: string): MoveData => {
    const mv = moveMap.get(name);
    if (!mv) throw new Error(`Move not found: ${name}`);
    return mv;
  };

  const cMove = lookup(challengerMove);
  const oMove = lookup(opponentMove);

  const applyOpponentDelta = (
    target: PlayerState,
    delta: Partial<PlayerState> | undefined
  ) => {
    if (!delta) return;
    if (delta.hp !== undefined) target.hp += delta.hp;
    if (delta.buff_defense !== undefined)
      target.buff_defense = delta.buff_defense;
    if (delta.buff_offense !== undefined)
      target.buff_offense = delta.buff_offense;
    if (delta.buff_speed !== undefined) target.buff_speed = delta.buff_speed;
    if ((delta as any).form !== undefined) target.form = (delta as any).form;
  };

  const applyUserDelta = (
    target: PlayerState,
    delta: Partial<PlayerState> | undefined
  ) => {
    if (!delta) return;
    if (delta.hp !== undefined) target.hp += delta.hp;
    if (delta.buff_defense !== undefined)
      target.buff_defense = delta.buff_defense;
    if (delta.buff_offense !== undefined)
      target.buff_offense = delta.buff_offense;
    if (delta.buff_speed !== undefined) target.buff_speed = delta.buff_speed;
    if ((delta as any).form !== undefined) target.form = (delta as any).form;
  };

  const cSpeed = cState.buff_speed;
  const oSpeed = oState.buff_speed;
  let challengerFirst = false;
  if (cSpeed > oSpeed) challengerFirst = true;
  else if (cSpeed < oSpeed) challengerFirst = false;
  else challengerFirst = Math.random() < 0.5;

  let firstRes, secondRes;
  if (challengerFirst) {
    firstRes = moveHandlers[cMove.type](cState, oState, cMove);
    applyOpponentDelta(oState, firstRes.opponentDelta);
    applyUserDelta(cState, firstRes.userDelta);
    if (oState.hp <= 0) {
      turn += 1;
      await redisClient.hSet(`duel:${duelId}`, {
        [`${challengerId}:hp`]: Math.max(0, cState.hp),
        [`${challengerId}:buff_defense`]: cState.buff_defense,
        [`${challengerId}:buff_offense`]: cState.buff_offense,
        [`${challengerId}:buff_speed`]: cState.buff_speed,
        [`${challengerId}:form`]: cState.form,
        [`${challengerId}:buffs`]: JSON.stringify(cState.buffs),
        [`${challengerId}:debuffs`]: JSON.stringify(cState.debuffs),
        [`${opponentId}:hp`]: Math.max(0, oState.hp),
        [`${opponentId}:buff_defense`]: oState.buff_defense,
        [`${opponentId}:buff_offense`]: oState.buff_offense,
        [`${opponentId}:buff_speed`]: oState.buff_speed,
        [`${opponentId}:buffs`]: JSON.stringify(oState.buffs),
        [`${opponentId}:debuffs`]: JSON.stringify(oState.debuffs),
        [`${opponentId}:form`]: oState.form,
        currentTurn: turn,
        [`${challengerId}:moveUsed`]: "",
        [`${opponentId}:moveUsed`]: "",
      });
      await redisClient.del(`duel:${duelId}`);
      await DuelModel.deleteOne({
        users: { $all: [challengerId, opponentId] },
      });
      const winner = challengerUser.username;
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
    secondRes = moveHandlers[oMove.type](oState, cState, oMove);
    applyOpponentDelta(cState, secondRes.opponentDelta);
    applyUserDelta(oState, secondRes.userDelta);
  } else {
    firstRes = moveHandlers[oMove.type](oState, cState, oMove);
    applyOpponentDelta(cState, firstRes.opponentDelta);
    applyUserDelta(oState, firstRes.userDelta);
    if (cState.hp <= 0) {
      turn += 1;
      await redisClient.hSet(`duel:${duelId}`, {
        [`${challengerId}:hp`]: Math.max(0, cState.hp),
        [`${challengerId}:buff_defense`]: cState.buff_defense,
        [`${challengerId}:buff_offense`]: cState.buff_offense,
        [`${challengerId}:buff_speed`]: cState.buff_speed,
        [`${challengerId}:form`]: cState.form,
        [`${challengerId}:buffs`]: JSON.stringify(cState.buffs),
        [`${challengerId}:debuffs`]: JSON.stringify(cState.debuffs),
        [`${opponentId}:hp`]: Math.max(0, oState.hp),
        [`${opponentId}:buff_defense`]: oState.buff_defense,
        [`${opponentId}:buff_offense`]: oState.buff_offense,
        [`${opponentId}:buff_speed`]: oState.buff_speed,
        [`${opponentId}:buffs`]: JSON.stringify(oState.buffs),
        [`${opponentId}:debuffs`]: JSON.stringify(oState.debuffs),
        [`${opponentId}:form`]: oState.form,
        currentTurn: turn,
        [`${challengerId}:moveUsed`]: "",
        [`${opponentId}:moveUsed`]: "",
      });
      await redisClient.del(`duel:${duelId}`);
      await DuelModel.deleteOne({
        users: { $all: [challengerId, opponentId] },
      });
      const winner = opponentUser.username;
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
    secondRes = moveHandlers[cMove.type](cState, oState, cMove);
    applyOpponentDelta(oState, secondRes.opponentDelta);
    applyUserDelta(cState, secondRes.userDelta);
  }

  cState.buff_defense = Math.max(0, cState.buff_defense);
  oState.buff_defense = Math.max(0, oState.buff_defense);

  cState.hp = Math.min(cState.maxHp, cState.hp);
  oState.hp = Math.min(oState.maxHp, oState.hp);

  turn += 1;
  await redisClient.hSet(`duel:${duelId}`, {
    [`${challengerId}:hp`]: Math.max(0, cState.hp),
    [`${challengerId}:buff_defense`]: cState.buff_defense,
    [`${challengerId}:buff_offense`]: cState.buff_offense,
    [`${challengerId}:buff_speed`]: cState.buff_speed,
    [`${challengerId}:form`]: cState.form,
    [`${challengerId}:buffs`]: JSON.stringify(cState.buffs),
    [`${challengerId}:debuffs`]: JSON.stringify(cState.debuffs),

    [`${opponentId}:hp`]: Math.max(0, oState.hp),
    [`${opponentId}:buff_defense`]: oState.buff_defense,
    [`${opponentId}:buff_offense`]: oState.buff_offense,
    [`${opponentId}:buff_speed`]: oState.buff_speed,
    [`${opponentId}:buffs`]: JSON.stringify(oState.buffs),
    [`${opponentId}:debuffs`]: JSON.stringify(oState.debuffs),
    [`${opponentId}:form`]: oState.form,

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
    `${firstRes.message}\n${secondRes.message}`
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

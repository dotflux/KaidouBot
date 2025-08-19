import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonInteraction,
} from "discord.js";
import { DuelModel } from "../../db/models/duel";
import { duelStartedEmbed } from "./embeds/duelStartedEmbed";
import { User } from "discord.js";
import { duelActionSelect } from "./dropdowns/duelActionSelect";
import redisClient from "../../db/redis";
import { UserModel } from "../../db/models/user";
import { generateDuelImage } from "./embeds/generateDuelVsImage";
import { duelLoadingEmbed } from "./embeds/duelLoadingEmbed";

export const createDuelBattleground = async (
  interaction: ButtonInteraction,
  canInteract: string[],
  userObjs: { challenger: User; opponent: User }
) => {
  await interaction.deferUpdate();

  const loadingEmbed = duelLoadingEmbed();

  await interaction.message.edit({
    content: "",
    embeds: [loadingEmbed],
    components: [],
  });

  const imageBuffer = await generateDuelImage(
    userObjs.challenger.displayAvatarURL(),
    userObjs.opponent.displayAvatarURL()
  );
  const base64Image = imageBuffer.toString("base64");

  const duelId = `${canInteract[0]}:${canInteract[1]}`;
  const duelDocument = new DuelModel({
    challengerId: canInteract[0],
    opponentId: canInteract[1],
    users: [canInteract[0], canInteract[1]],
    backgroundImage: base64Image,
  });

  await duelDocument.save();

  const challengerUser = await UserModel.findOne({
    userId: userObjs.challenger.id,
  });
  const opponentUser = await UserModel.findOne({
    userId: userObjs.opponent.id,
  });
  if (!challengerUser || !opponentUser) {
    throw new Error("Something went wrong");
  }

  await redisClient.hSet(`duel:${duelId}`, {
    challengerId: canInteract[0],
    opponentId: canInteract[1],

    [`${canInteract[0]}:hp`]: challengerUser.maxHp,
    [`${canInteract[1]}:hp`]: opponentUser.maxHp,
    [`${canInteract[0]}:maxHp`]: challengerUser.maxHp,
    [`${canInteract[1]}:maxHp`]: opponentUser.maxHp,

    [`${canInteract[0]}:moveUsed`]: "",
    [`${canInteract[1]}:moveUsed`]: "",

    [`${canInteract[0]}:buff_offense`]: 0,
    [`${canInteract[1]}:buff_offense`]: 0,
    [`${canInteract[0]}:buff_defense`]: challengerUser.initialDef,
    [`${canInteract[1]}:buff_defense`]: opponentUser.initialDef,
    [`${canInteract[0]}:buff_speed`]: challengerUser.speed,
    [`${canInteract[1]}:buff_speed`]: opponentUser.speed,
    [`${canInteract[0]}:maxDef`]: challengerUser.maxDef,
    [`${canInteract[1]}:maxDef`]: opponentUser.maxDef,
    [`${canInteract[0]}:form`]: "",
    [`${canInteract[1]}:form`]: "",
    [`${canInteract[0]}:resistance`]: 0,
    [`${canInteract[1]}:resistance`]: 0,

    currentTurn: 0,
  });

  await redisClient.expire(`duel:${duelId}`, 600);

  const { embed, attachment } = await duelStartedEmbed(
    userObjs.challenger.username,
    userObjs.opponent.username,
    base64Image,
    { challenger: challengerUser.maxHp, opponent: opponentUser.maxHp },
    {
      challenger: challengerUser.initialDef,
      opponent: opponentUser.initialDef,
    },
    { challenger: challengerUser.maxDef, opponent: opponentUser.maxDef }
  );

  const duelCompWithId = duelActionSelect.setCustomId(
    `duelActionSelect_${duelId}`
  );
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    duelCompWithId
  );

  await interaction.message.edit({
    embeds: [embed],
    components: [row],
    files: [attachment],
  });
};

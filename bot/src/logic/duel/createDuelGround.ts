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

export const createDuelBattleground = async (
  interaction: ButtonInteraction,
  canInteract: string[],
  userObjs: { challenger: User; opponent: User }
) => {
  const duelId = `${canInteract[0]}:${canInteract[1]}`;
  const duelDocument = new DuelModel({
    challengerId: canInteract[0],
    opponentId: canInteract[1],
    users: [canInteract[0], canInteract[1]],
  });

  duelDocument.save();

  await redisClient.hSet(`duel:${duelId}`, {
    challengerId: canInteract[0],
    opponentId: canInteract[1],
    [`${canInteract[0]}:hp`]: 500,
    [`${canInteract[1]}:hp`]: 500,
    [`${canInteract[0]}:moveUsed`]: "",
    [`${canInteract[1]}:moveUsed`]: "",
    [`${canInteract[0]}:speed`]: 50,
    [`${canInteract[1]}:speed`]: 40,
    proceedTurn: 0,
  });

  await redisClient.expire(`duel:${duelId}`, 600);

  const embed = duelStartedEmbed(
    userObjs.challenger.username,
    userObjs.opponent.username,
    { challenger: 500, opponent: 500 }
  );

  const duelCompWithId = duelActionSelect.setCustomId(
    `duelActionSelect_${duelId}`
  );
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    duelCompWithId
  );

  await interaction.update({
    content: "",
    embeds: [embed],
    components: [row],
  });
};

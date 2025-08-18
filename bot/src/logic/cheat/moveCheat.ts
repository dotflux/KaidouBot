import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { UserModel } from "../../db/models/user";
import { errorEmbed } from "../register/errorEmbed";
import fsMoves from "../../moves/fsMoves.json";
import { MoveData } from "../duel/moves";
import { addMoveToUser } from "../../db/models/user";

const moveMap: Map<string, MoveData> = (() => {
  const m = new Map<string, MoveData>();
  for (const cat of Object.values(fsMoves) as unknown as any[]) {
    for (const mv of cat as any[]) {
      m.set(mv.name, mv as MoveData);
    }
  }
  return m;
})();

export const moveCheat = async (
  interaction: ChatInputCommandInteraction,
  moveStyle: string,
  moveName: string
) => {
  try {
    const user = await UserModel.findOne({ userId: interaction.user.id });
    if (!user) {
      const error = errorEmbed("User not in database");
      await interaction.reply({
        embeds: [error],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const mv = moveMap.get(moveName);
    if (!mv) {
      const error = errorEmbed(`Move ${moveName} is not in the moves database`);
      await interaction.reply({
        embeds: [error],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const add = await addMoveToUser(interaction.user.id, moveStyle, mv);
    if (!add.ok) {
      const error = errorEmbed(`${add.reason}`);
      await interaction.reply({
        embeds: [error],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      content: `Added move ${moveName} to ${moveStyle}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.log(error);
  }
};

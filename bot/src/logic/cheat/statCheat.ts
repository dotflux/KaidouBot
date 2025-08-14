import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { UserModel } from "../../db/models/user";
import { errorEmbed } from "../register/errorEmbed";

export type StatCheat = "maxDef" | "initialDef" | "speed" | "maxHp";
export const CHEATSTATS = ["maxDef", "initialDef", "speed", "maxHp"];

export const statCheat = async (
  interaction: ChatInputCommandInteraction,
  stat: StatCheat,
  newAmount: number
) => {
  try {
    const user = await UserModel.findOne({ userId: interaction.user.id });
    if (!user) {
      await interaction.reply({
        content: "User not in database",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (!CHEATSTATS.includes(stat)) {
      const error = errorEmbed("Invalid stat mentioned");
      await interaction.reply({
        embeds: [error],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await UserModel.updateOne(
      { userId: interaction.user.id },
      { $set: { [stat]: newAmount } }
    );

    await interaction.reply({
      content: `Changed your ${stat} to ${newAmount}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.log(error);
  }
};

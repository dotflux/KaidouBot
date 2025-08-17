import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { UserModel } from "../../db/models/user";
import { errorEmbed } from "../register/errorEmbed";

export const moneyCheat = async (
  interaction: ChatInputCommandInteraction,
  newAmount: number
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
    if (newAmount < 0) {
    }
    await UserModel.updateOne(
      { userId: interaction.user.id },
      { $inc: { money: newAmount } }
    );

    await interaction.reply({
      content: `Increased your money by ${newAmount}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.log(error);
  }
};

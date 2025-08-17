import { ChatInputCommandInteraction } from "discord.js";
import { UserModel } from "../../db/models/user";
import { errorEmbed } from "../register/errorEmbed";
import { profileEmbed } from "./embeds/profileEmbed";

export const sendProfile = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();
    const user = await UserModel.findOne({ userId: interaction.user.id });
    if (!user) {
      const error = errorEmbed("User not found!");
      await interaction.editReply({ embeds: [error] });
      return;
    }
    const { embed, attachment } = await profileEmbed(
      interaction.user.username,
      interaction.user.displayAvatarURL(),
      { currentXp: user.xp, nextRankXp: user.nextRankXp },
      user.faction,
      user.race,
      user.fightingStyle,
      user.equippedWeapon || "",
      user.currentDf || "",
      user.money || 0,
      user.gems || 0,
      { maxHp: user.maxHp, maxDef: user.maxDef, speed: user.speed },
      { duelsWon: user.duelsWon, duelsLost: user.duelsLost }
    );

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  } catch (error) {
    console.log(error);
  }
};

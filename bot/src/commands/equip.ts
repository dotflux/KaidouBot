import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { errorEmbed } from "../logic/register/errorEmbed";
import { dfEquip } from "../logic/equip/dfEquip";
import { swordEquip } from "../logic/equip/swordEquip";
import { gunEquip } from "../logic/equip/gunEquip";

export const data = new SlashCommandBuilder()
  .setName("equip")
  .setDescription("Equip a weapon or devil fruit")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("devil_fruit")
      .setDescription("Eat a devil fruit")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of the devil fruit")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("sword")
      .setDescription("Equip a sword")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of the sword")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("gun")
      .setDescription("Equip a gun")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of the gun")
          .setRequired(true)
      )
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  try {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "devil_fruit":
        const nameDf = interaction.options.getString("name", true);
        await dfEquip(interaction, nameDf);
        break;
      case "sword":
        const nameSword = interaction.options.getString("name", true);
        await swordEquip(interaction, nameSword);
        break;
      case "gun":
        const nameGun = interaction.options.getString("name", true);
        await gunEquip(interaction, nameGun);
      default:
        const error = errorEmbed("Unknown equip command");
        await interaction.reply({
          embeds: [error],
          flags: MessageFlags.Ephemeral,
        });
        break;
    }
  } catch (error) {
    console.log(error);
  }
};

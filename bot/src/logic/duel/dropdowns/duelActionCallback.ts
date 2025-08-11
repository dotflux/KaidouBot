import {
  StringSelectMenuInteraction,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { errorEmbed } from "../../register/errorEmbed";
import { buildFightingStyleMoveDropdown } from "./duelActionFs";
import { UserModel } from "../../../db/models/user";
import { DuelModel } from "../../../db/models/duel";
import redisClient from "../../../db/redis";
import { buildDevilFruitMoveDropdown } from "./duelActionFs";
import { buildTransformationDropdown } from "./duelActionFs";
import { buildRokushikiDropdown } from "./duelActionFs";
import { buildWeaponDropdown } from "./duelActionFs";

export const execute = async (interaction: StringSelectMenuInteraction) => {
  try {
    const customIdParts = interaction.customId.split("_");
    const duelId = customIdParts[1];
    const [challenger, opponent] = duelId.split(":");

    const otherId = interaction.user.id === challenger ? opponent : challenger;
    if (
      interaction.user.id !== challenger &&
      interaction.user.id !== opponent
    ) {
      const embed = errorEmbed("This fight is not yours to fight!");
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const duel = await DuelModel.findOne({
      users: { $all: [challenger, opponent] },
    });
    if (!duel) {
      const embed = errorEmbed("This duel does not exist");
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const action = interaction.values[0];
    if (action === "fighting_style") {
      const dropdown = await buildFightingStyleMoveDropdown(
        interaction.user.id,
        duelId
      );

      if (!dropdown) {
        await interaction.reply({
          content: "Could not find your moves.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.reply({
        content: "Pick your move",
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            dropdown
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (action === "devil_fruit") {
      const dropdown = await buildDevilFruitMoveDropdown(
        interaction.user.id,
        duelId
      );

      if (!dropdown) {
        await interaction.reply({
          content: "Could not find your moves.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.reply({
        content: "Pick your move",
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            dropdown
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (action === "transformation") {
      const dropdown = await buildTransformationDropdown(
        interaction.user.id,
        duelId
      );

      if (!dropdown) {
        await interaction.reply({
          content: "You have not used a transformation",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.reply({
        content: "Pick your move",
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            dropdown
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (action === "rokushiki") {
      const dropdown = await buildRokushikiDropdown(
        interaction.user.id,
        duelId
      );

      if (!dropdown) {
        await interaction.reply({
          content: "Could not find your moves.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.reply({
        content: "Pick your move",
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            dropdown
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (action === "weapon") {
      const dropdown = await buildWeaponDropdown(interaction.user.id, duelId);

      if (!dropdown) {
        await interaction.reply({
          content: "Could not find your moves.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.reply({
        content: "Pick your move",
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            dropdown
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (action === "forfeit") {
      const otherUser = await interaction.client.users.fetch(otherId);
      await redisClient.del(`duel:${duelId}`);
      await DuelModel.deleteOne({
        users: { $all: [challenger, opponent] },
      });
      await interaction.update({
        content: `${interaction.user.username} forfeited from the battle ${otherUser.username} won the battle`,
        embeds: [],
        components: [],
        files: [],
      });
    }
  } catch (error) {
    console.log(error);
  }
};

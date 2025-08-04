import { EmbedBuilder } from "discord.js";
import { raceEmojis } from "../../emojis/raceEmojis";
import { factionEmojis } from "../../emojis/factionEmojis";

export const finalRegisterEmbed = (faction: string, race: string) => {
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("Registration Complete!")
    .setDescription(
      `Your registration is now complete! Go ahead and venture out into the world of KaidouBot!`
    )
    .setTimestamp()
    .setFields(
      {
        name: `${factionEmojis(faction)} Faction`,
        value: `You picked the **${faction}** faction.`,
      },
      {
        name: `${raceEmojis(race)} Race`,
        value: `You picked the **${race}** race.`,
      }
    );

  return embed;
};

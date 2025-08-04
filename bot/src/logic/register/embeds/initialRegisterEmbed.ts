import { EmbedBuilder } from "discord.js";
import { factionEmojis } from "../../emojis/factionEmojis";

export const createInitialRegisterEmbed = (username: string) => {
  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle("Start Your Journey Now!")
    .setDescription(
      `Welcome ${username}.This is KaidouBot, a one piece bot completely based on the anime/manga. Below you have choices to choose from and those choices are:`
    )
    .setTimestamp()
    .setFields(
      {
        name: `${factionEmojis("pirate")} Pirate`,
        value:
          "Start as a pirate and fight for your freedom! Climb ranks, wreck havoc earn trust, increase your bounty and more!",
      },
      {
        name: `${factionEmojis("marine")} Marine`,
        value:
          "Start as a marine and fight for the world government! Climb ranks, stop pirates from wrecking havoc, increase your reputation and more!",
      },
      {
        name: `${factionEmojis("ra")} Revolutionary Army`,
        value:
          "Start as a member of the revolutionary army and fight for the freedom of the world! Climb ranks, revolt against the world government, increase your influence and more!",
      },
      {
        name: `${factionEmojis("bh")} Bounty Hunter`,
        value:
          "Start as a bounty hunter and hunt down players to increase your bounty! Climb ranks, wreck havoc earn trust, increase your fear and more!",
      }
    )
    .setImage(
      "https://i.ibb.co/Tc0NMRR/ace-wano-one-piece-ocean-waves-iea8x889ayzu4r5k.gif"
    );
  return embed;
};

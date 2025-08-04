import { EmbedBuilder } from "discord.js";
import { raceEmojis } from "../../emojis/raceEmojis";

export const raceRegisterEmbed = () => {
  const embed = new EmbedBuilder()
    .setColor("DarkPurple")
    .setTitle("Further Registration")
    .setDescription(
      `You picked your faction now it is time to continue on with the registration, you will be asked to pick a race from the multiple given options`
    )
    .setTimestamp()
    .setFields(
      {
        name: `${raceEmojis("mink")} Mink`,
        value:
          "Start as a mink, known for their agility minks also master in fighting styles following electricity which can be formed into further different art.",
      },
      {
        name: `${raceEmojis("cyborg")} Cyborg`,
        value:
          "Start as a cyborg, known for their advanced technology and their genius to create new types of weapons.",
      },
      {
        name: `${raceEmojis("fishman")} Fishman`,
        value:
          "Start as a fishman, known for their unique ability to breathe underwater and their ability to control water to form various techniques.",
      },
      {
        name: `${raceEmojis("human")} Human`,
        value:
          "Start as a human, known for their ability to adapt to any situation quickly. It is stated that once in a while a human can be born with a **unique ability**..",
      }
    );

  return embed;
};

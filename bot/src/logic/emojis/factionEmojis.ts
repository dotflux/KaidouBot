export const factionEmojis = (faction: string) => {
  switch (faction) {
    case "pirate":
      return "<:pirate:1401871551325802536>";
    case "marine":
      return "<:marine:1401871957229703270>";
    case "ra":
      return "<:ra:1401874158966542336>";
    case "bh":
      return "<:bounty_h:1401874207108890664>";
    default:
      return "";
  }
};

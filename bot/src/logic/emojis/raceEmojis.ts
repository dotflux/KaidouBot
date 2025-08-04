export const raceEmojis = (race: string) => {
  switch (race) {
    case "mink":
      return "<:mink:1401874254030569613>";
    case "cyborg":
      return "<:cyborg:1401874289262854256>";
    case "fishman":
      return "<:fishman:1401874341112840425>";
    case "human":
      return "<:human:1401876653214269481>";
    default:
      return "";
  }
};

export const inventoryThumbnailEmojis = (type: string) => {
  switch (type) {
    case "chest":
      return "https://cdn.discordapp.com/emojis/1405939671338455170.png";
    case "swords":
      return "https://cdn.discordapp.com/emojis/1404407206174134302.png";
    case "guns":
      return "https://cdn.discordapp.com/emojis/1405939623552880824.png";
    case "devilFruit":
      return "https://cdn.discordapp.com/emojis/1404407694068023399.png";
    default:
      return undefined;
  }
};

export type Faction = "pirate" | "marine" | "ra" | "bh";
export type Race = "mink" | "cyborg" | "fishman" | "human";
export type Move = "offense" | "defense" | "special";
export type Rarity = "common" | "rare" | "epic" | "legendary";
export const RARITIES: Rarity[] = ["common", "rare", "epic", "legendary"];

export const DEVIL_FRUITS = new Set([
  "mera",
  "gomu",
  "hie",
  "magu",
  "ope",
  "zushi",
  "chop",
  "kage",
  "rumble",
  "kilo",
  "falcon",
  "spring",
  "gura",
  "doku",
  "tori",
]);

export const SWORDS = new Set([
  "ittoryu",
  "nitoryu",
  "santoryu",
  "ace",
  "yoru",
  "greataxe",
  "hammer",
  "dagger",
  "raiper",
  "lance",
  "greathammer",
  "dual_daggers",
  "katana",
]);

export const GUNS = new Set([
  "starkk_guns",
  "slingshot",
  "double_flintlock",
  "gero_gero_gun",
]);

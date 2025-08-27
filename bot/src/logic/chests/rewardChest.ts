import { ChatInputCommandInteraction } from "discord.js";
import { Rarity } from "../../types";

const commonItems = [
  "chop",
  "spring",
  "kilo",
  "raiper",
  "katana",
  "dagger",
  "lance",
];
const rareItems = [
  "mera",
  "rumble",
  "falcon",
  "hammer",
  "slingshot",
  "double_flintlock",
  "ittoryu",
];
const epicItems = [
  "magu",
  "kage",
  "hie",
  "greataxe",
  "greathammer",
  "dual_daggers",
  "nitoryu",
];
const legendaryItems = [
  "gomu",
  "ope",
  "zushi",
  "gura",
  "ace",
  "yoru",
  "starkk_guns",
  "gero_gero_gun",
  "santoryu",
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickNUnique<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return [];
  if (arr.length <= n) {
    const copy = [...arr];
    // if fewer than n, allow duplicates by filling with random picks
    while (copy.length < n) copy.push(arr[randInt(0, arr.length - 1)]);
    return copy;
  }
  const out: T[] = [];
  const used = new Set<number>();
  while (out.length < n) {
    const idx = randInt(0, arr.length - 1);
    if (used.has(idx)) continue;
    used.add(idx);
    out.push(arr[idx]);
  }
  return out;
}

export const rewardChest = async (rarity: Rarity) => {
  let pool: string[] = [];
  let belliMin = 0;
  let belliMax = 0;
  let gemsMin = 0;
  let gemsMax = 0;

  switch (rarity) {
    case "rare":
      pool = rareItems;
      belliMin = 200;
      belliMax = 400;
      break;
    case "epic":
      pool = epicItems;
      belliMin = 1000;
      belliMax = 3000;
      gemsMin = 10;
      gemsMax = 20;
      break;
    case "legendary":
      pool = legendaryItems;
      belliMin = 6000;
      belliMax = 15000;
      gemsMin = 100;
      gemsMax = 200;
      break;
    default:
      pool = commonItems;
      belliMin = 20;
      belliMax = 50;
  }

  const itemsPicked = pickNUnique(pool, 3);
  const belli = randInt(belliMin, belliMax);
  const gems = gemsMin > 0 ? randInt(gemsMin, gemsMax) : 0;

  return {
    rarity,
    items: itemsPicked,
    belli,
    gems,
  };
};

import { EmbedBuilder } from "discord.js";
import { factionEmojis } from "../../emojis/factionEmojis";
import { raceEmojis } from "../../emojis/raceEmojis";
import { generateXpBar } from "../../emojis/generateXpBar";
import { capitalize } from "../../emojis/capitalize";
import sharp from "sharp";
import { AttachmentBuilder } from "discord.js";

const returnNormalNameFs = (fs: string) => {
  switch (fs) {
    case "fishmanKarate":
      return "Fishman Karate";
    case "hands":
      return "Hands";
    case "electricClaw":
      return "Electric Claw";
    case "mechanics":
      return "Mechanics";
    default:
      return "None";
  }
};

const returnNormalNameFaction = (faction: string) => {
  switch (faction) {
    case "ra":
      return "Revolutionary Army";
    case "bh":
      return "Bounty Hunter";
    case "pirate":
      return "Pirate";
    case "marine":
      return "Marine";
  }
};

export async function makeRoundedAvatarBuffer(
  avatarUrl: string,
  size = 128,
  borderPx = 6,
  borderColor = "#6b21a8"
): Promise<Buffer> {
  const res = await fetch(avatarUrl);
  if (!res.ok) throw new Error("Failed to fetch avatar");
  const imgBuf = Buffer.from(await res.arrayBuffer());

  const total = size + borderPx * 2;

  const circleMaskSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
  </svg>`;

  const rounded = await sharp(imgBuf)
    .resize(size, size, { fit: "cover" })
    .composite([{ input: Buffer.from(circleMaskSvg), blend: "dest-in" }])
    .png()
    .toBuffer();

  const backgroundSvg = `<svg width="${total}" height="${total}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="transparent"/>
    <circle cx="${total / 2}" cy="${total / 2}" r="${
    total / 2
  }" fill="${borderColor}"/>
  </svg>`;

  const composed = await sharp(Buffer.from(backgroundSvg))
    .composite([{ input: rounded, left: borderPx, top: borderPx }])
    .png()
    .toBuffer();

  return composed;
}

export const profileEmbed = async (
  username: string,
  pfp: string,
  xp: { currentXp: number; nextRankXp: number },
  faction: string,
  race: string,
  fightingStyle: string,
  equippedWeapon: string,
  currentDf: string,
  money: number,
  gems: number,
  stats: { maxHp: number; maxDef: number; speed: number },
  record: { duelsWon: number; duelsLost: number }
) => {
  const xpBar = generateXpBar(xp.currentXp, xp.nextRankXp);
  const buffer = await makeRoundedAvatarBuffer(pfp);
  const attachment = new AttachmentBuilder(buffer, { name: "pfp.png" });
  const embed = new EmbedBuilder()
    .setTitle(`${username}'s Profile`)
    .setColor("DarkPurple")
    .setThumbnail("attachment://pfp.png")
    .setDescription(`**XP: ${xp.currentXp}/${xp.nextRankXp}**\n[${xpBar}]`)
    .addFields(
      {
        name: "About",
        value: `${factionEmojis(faction)} ${returnNormalNameFaction(
          faction
        )}\n${raceEmojis(race)} ${capitalize(race)}`,
      },
      {
        name: "Fighting Style",
        value: `<:fs:1404408553153757206> ${returnNormalNameFs(fightingStyle)}`,
      },
      {
        name: "Devil Fruit",
        value: `<:df:1404407694068023399> ${capitalize(currentDf) || "None"}`,
      },
      {
        name: "Weapon",
        value: `<:weapon:1404407206174134302> ${
          capitalize(equippedWeapon) || "None"
        }`,
      },
      {
        name: "Balance",
        value: `<:belli:1404425845363445770> ${money}\n:gem: ${gems}`,
      },
      {
        name: "Stats",
        value: `❤ HP: ${stats.maxHp}\n🛡 DEF: ${stats.maxDef}\n💨 SPEED: ${stats.speed}`,
      },
      {
        name: "Record",
        value: `🏆 Wins: ${record.duelsWon}\n❌ Losses: ${record.duelsLost}`,
      }
    )
    .setTimestamp();
  return { embed, attachment };
};

import { createCanvas, loadImage, Image } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";

export async function generateDuelImage(
  challengerPfp: string,
  opponentPfp: string
): Promise<Buffer> {
  const width = 2048;
  const height = 914;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Load background
  const bg = await loadImage(path.join(__dirname, "./duelVsBg.png"));
  ctx.drawImage(bg, 0, 0, width, height);

  // Load avatars
  const challenger = await loadImage(challengerPfp);
  const opponent = await loadImage(opponentPfp);

  // Draw circular avatars
  const avatarSize = 512;
  const drawCircleImage = (
    image: InstanceType<typeof Image>,
    x: number,
    y: number
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      x + avatarSize / 2,
      y + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, x, y, avatarSize, avatarSize);
    ctx.restore();
  };

  drawCircleImage(challenger, 200, height / 2 - avatarSize / 2); // Left side
  drawCircleImage(
    opponent,
    width - 200 - avatarSize,
    height / 2 - avatarSize / 2
  ); // Right side

  return canvas.encode("png"); // returns buffer
}

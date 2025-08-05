import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { registerAllCommands } from "./registerCommands";
import { handleInteraction } from "./interactionHandler";
import { connectToMongo } from "./db/mongo";
import redisClient from "./db/redis";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
  await connectToMongo();
  await redisClient.ping();
  registerAllCommands(client);
});

client.on("interactionCreate", handleInteraction);

client.login(process.env.BOT_TOKEN!);

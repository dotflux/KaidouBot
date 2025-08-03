import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Interaction,
} from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .toJSON(),
];

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);

  // Register slash commands globally (can take up to 1 hour to appear)
  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);

  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commands,
    });
    console.log("🔃 Global slash commands registered!");
  } catch (err) {
    console.error("❌ Failed to register slash commands:", err);
  }
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 Pong!");
  }
});

client.login(process.env.BOT_TOKEN!);

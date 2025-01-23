import { Client, Events, GatewayIntentBits, Interaction } from "discord.js";
import type { ClientWithCommands } from "../types.js";
import { deployCommands, readCommands } from "./commands.js";
import error from "./error.js";

/**
 * The object we use to connect to our running Discord bot
 */
const client: ClientWithCommands = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Read commands from the 'commands' directory into the 'commands' property on the client
client.commands = await readCommands();
// Deploy these commands to our Discord bot so users can run them
await deployCommands(client);

// When a user runs a slash command, process it here
client.on(Events.InteractionCreate, (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const client: ClientWithCommands = interaction.client;

  // This means you forgot to do 'client.commands = await readCommands()'
  if (!client.commands) {
    error("commandHandler: client.commands does not exist");
    return;
  }

  const command = client.commands.get(interaction.commandName);

  // This means you deleted a command but haven't run 'deployCommands(client)' since
  if (!command) {
    error("commandHandler: triggered command does not exist");
    return;
  }

  try {
    command.execute(interaction);
  } catch (e) {
    error(`commandHandler: ${e}`);
  }
});

// Print a short message once our bot has logged in
client.once(Events.ClientReady, (readyClient: ClientWithCommands) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}.`);
});

export default client;

import { Client, Events, GatewayIntentBits } from "discord.js";
import createEventListeners from "./startup/create-event-listeners.js";
import deployCommands from "./startup/deploy-commands.js";
import getCommands from "./startup/get-commands.js";
import type { ClientWithCommands, Command } from "./types.js";

start();

async function start() {
  // Fail if necessary environment variables not provided
  if (!process.env.TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) return;

  // Creates a new Client with the necessary intents (permissions).
  const client: ClientWithCommands = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Login to our bot's Discord profile using our bot's token.
  client.login(process.env.TOKEN);

  // Read the slash commands from the 'commands' subdirectory into an array.
  const commands: Command[] = await getCommands();
  // Deploy these slash commands to the server.
  await deployCommands(client, commands);

  // Set the client to listen for slash commands, and for new members joining.
  createEventListeners(client);

  // Once the bot is ready for use, print to console.
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}.`);
  });
}

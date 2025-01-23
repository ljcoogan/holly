import {
  REST,
  type RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { ClientWithCommands, Command } from "../types.js";
import error from "./error.js";

/**
 * Reads files stored in the 'commands' directory into a Map<string, Command()>
 *
 * @returns A mapping of command names to their respective Command objects
 */
export async function readCommands() {
  const foldersPath = join(process.cwd(), "dist/commands");
  const commandFolders = readdirSync(foldersPath);

  const map = new Map<string, Command>();
  for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter((file) =>
      file.endsWith(".js")
    );
    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const commandModule = await import(filePath);
      const command: Command = commandModule.default;
      map.set(command.data.name, command);
    }
  }

  return map;
}

/**
 * Deploys slash commands to the Discord bot
 *
 * @param client - The client object
 */
export async function deployCommands(client: ClientWithCommands) {
  if (!client.commands) {
    error("deployCommands: client.commands does not exist");
    return;
  }

  const commandsJSON = new Array<RESTPostAPIApplicationCommandsJSONBody>();
  for (const [_, command] of client.commands) {
    commandsJSON.push(command.data.toJSON());
  }

  const rest = new REST().setToken(process.env.TOKEN!);
  try {
    const data = (await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        process.env.GUILD_ID!
      ),
      {
        body: commandsJSON,
      }
    )) as [];
    console.log(
      `Successfully deployed ${data.length} application (/) commands.`
    );
  } catch (e) {
    error(`deployCommands: ${e}`);
  }
}

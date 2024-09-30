import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "../types.js";

export default async function getCommands(): Promise<Command[]> {
  const commands = [];

  const foldersPath = join(process.cwd(), "dist/commands");
  const commandFolders = readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const commandModule = await import(filePath);
      const command: Command = commandModule.default;
      commands.push(command);
    }
  }

  return commands;
}

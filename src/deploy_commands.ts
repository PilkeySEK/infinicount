import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from 'discord.js';
import { client_id, token } from '../config.json';
import fs from 'node:fs';
import path from 'node:path';

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] | any[] = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command: { data: SlashCommandBuilder, execute: (interaction: any) => Promise<void> } = require(filePath);
        commands.push(command.data.toJSON());
	}
}

const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data: any = await rest.put(
			Routes.applicationCommands(client_id),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

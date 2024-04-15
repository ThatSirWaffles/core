const { REST, Routes } = require('discord.js');
const { clientid, mainguildid, staffguildid, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const staffcommands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			if (folder == "staff") {
				staffcommands.push(command.data.toJSON());
			} else {
				staffcommands.push(command.data.toJSON());
				commands.push(command.data.toJSON());
			}
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
};

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing  ${staffcommands.length} staff commands and ${commands.length} public commands`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const staffdata = await rest.put(
			Routes.applicationGuildCommands(clientid, staffguildid),
			{ body: staffcommands },
		);

		const data = await rest.put(
			Routes.applicationGuildCommands(clientid, mainguildid),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${staffdata.length} staff commands and ${data.length} public commands`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
});

rest.delete(Routes.applicationCommand(clientid, '971513465028104204'))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);
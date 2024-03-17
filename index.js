const fs = require('fs');
const path = require('path');

const scriptsFolder = './handlers';

const scriptFiles = fs.readdirSync(scriptsFolder).filter(file => file.endsWith('.js'));

scriptFiles.forEach(file => {
  const scriptPath = path.join(__dirname, scriptsFolder, file);
  require(scriptPath);
});

const { Client, GatewayIntentBits, REST, Collection, Events, Routes } = require('discord.js');
const { token, mainguildid, staffguildid } = require("./config.json");

global.client = new Client({intents: [GatewayIntentBits.Guilds],});

client.login(token);

client.guilds.fetch(mainguildid)
.then(guild => {
	global.mainguild = guild;
})

client.guilds.fetch(staffguildid)
.then(guild => {
	global.staffguild = guild;
})

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
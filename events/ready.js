const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Logged in as ${client.user.tag}!`);
		client.user.setStatus('dnd');
		client.user.setActivity('over Skyrden', { type: ActivityType.Watching });
	},
};
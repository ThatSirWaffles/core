const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Logged in as ${client.user.tag}!`);
		client.user.setStatus('dnd');
		client.user.setActivity('tickets in DMs', {type: ActivityType.Streaming, url: "https://www.youtube.com/watch?v=XCwvMGEe4I4"});
	},
};
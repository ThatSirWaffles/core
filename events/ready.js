const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Logged in as ${client.user.tag}!`);
		client.user.setStatus('dnd');
		client.user.setActivity('from your basement', {type: ActivityType.Streaming, url: "https://www.youtube.com/watch?v=xvFZjo5PgG0"});
	},
};
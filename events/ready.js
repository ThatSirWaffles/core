const { Events, ActivityType } = require('discord.js');
const { System } = require('../handlers/database');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const sys = await System.findOne();

		console.log('BOT >>			READY');
		client.user.setStatus('dnd');
		client.user.setActivity(sys.botStatus, {type: ActivityType.Watching});
	},
};
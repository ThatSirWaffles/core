const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
		console.log(message);
	},
};
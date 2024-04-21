const { Events, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const {info, success, fail, depts, supportguildid} = require("../config.json")
const {Ticket} = require("../handlers/database.js");

module.exports = {
	name: Events.ChannelDelete,
	async execute(channel) {
		if (channel.guild.id == supportguildid &&channel.parent && depts.some(dept => dept.id == channel.parent.id)) {
			const result = await Ticket.findOne({channel: channel.id});

			if (result) {
				client.users.cache.get(result.author).send({
					embeds: [
						new EmbedBuilder()
						.setColor("#2b2d31")	
						.setDescription(info +" *Your ticket has been closed.* Thank you for contacting us, and don't hesitate to open a new ticket if you require further support.")
					]
				});

				await result.deleteOne();
			}
		}
	}
};
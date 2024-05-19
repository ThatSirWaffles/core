const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ComponentType
} = require("discord.js");

const {
	success,
	info,
	fail,
	depts,
	logchannelid
} = require("../../config.json")

const {Ticket} = require("../../handlers/database.js");

const discordTranscripts = require('discord-html-transcripts');

module.exports = {
	category: 'support',
	data: data = new SlashCommandBuilder()
		.setName("unsubscribe")
		.setDescription("Unsubscribe from a ticket"),
	async execute(interaction) {
		if (interaction.channel.parent && depts.some(dept => dept.id == interaction.channel.parent.id)) {
			const result = await Ticket.findOne({channel: interaction.channel.id});

			if (result && result.subscribed.includes(interaction.user.id)) {
				result.subscribed = result.subscribed.filter(id => id != interaction.user.id);
				result.save();

				interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")
							.setDescription(success+" Unsubscribed from this ticket")
					],
					ephemeral: true
				});

				interaction.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")	
							.setDescription(info+` ${interaction.user} unsubscribed from this ticket`)
					]
				});
			} else {
				interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")	
							.setDescription(info+" You aren't subscribed to this ticket")
					],
					ephemeral: true
				});
			}
		} else {
			interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor("#2b2d31")	
						.setDescription(fail+" *Not a valid ticket*")
				],
				ephemeral: true
			});
		}
	},
};
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const {info, success, fail, rolesets} = require("../../config.json");
const { User } = require('../../handlers/database');
var pluralize = require('pluralize')

module.exports = {
	category: 'public',
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("View a leaderboard")
		.addStringOption(option =>
			option.setName("stat")
				.setDescription("The statistic to rank")
				.setRequired(true)
				.addChoices(
					{name: "streak", value: "streak"},
					{name: "skyrmont", value: "skyrmont"}
				)
		),
	async execute(interaction) {
		interaction.reply({
			embeds: [
				new EmbedBuilder()
				.setColor("#2b2d31")
				.setDescription(info+" Currently unavailable")
			],
			ephemeral: true
		})
	},
};
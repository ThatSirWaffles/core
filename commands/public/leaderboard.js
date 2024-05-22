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
					{name: "streak", value: "discord.streak"},
					{name: "skyrmont", value: "skyrmont"},
					{name: "flights", value: "flights"}
				)
		),
	async execute(interaction) {
		const val = interaction.options.getString("stat")
		var docs = null

		if (val == "flights") {
			docs = await User.aggregate([
				{ $project: { 
					count: { $size: "$flights" },
					document: "$$ROOT"
				}},
				{ $sort: { count: -1 }},
				{ $limit: 10 }
			  ]);
		} else {
			docs = await User.find({}).sort({[val]: -1}).limit(10);
		}

		var embed = new EmbedBuilder()
			.setColor("#2b2d31")

		if (val == "discord.streak") {
			embed.setTitle("Streak Leaderboard")
			embed.setDescription(docs.map(value => `<@${value.discord.id}> with **${pluralize("day", value.discord.streak, true)}**`).join('\n'))
		} else if (val == "skyrmont") {
			embed.setTitle("Skyrmont Leaderboard")
			embed.setDescription(docs.map(value => `<@${value.discord.id}> with **${value.skyrmont} sm.**`).join('\n'))
		} else if (val == "flights") {
			embed.setTitle("Flight Leaderboard")
			embed.setDescription(docs.map(value => `<@${value.document.discord.id}> with **${pluralize("flight", value.document.flights.length, true)}**`).join('\n'))
		}

		interaction.reply({
			embeds: [embed]
		})
	},
};
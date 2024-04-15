const {SlashCommandBuilder,EmbedBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder} = require("discord.js");
const {ticket} = require('../../handlers/database.js');
const {info} = require("../../config.json")

module.exports = {
	category: 'dev',
	data: data = new SlashCommandBuilder()
		.setName("dbtest")
		.setDescription("Just trying things")
		.setDefaultMemberPermissions(0),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});
		await new ticket({
			channel: interaction.channel.id,
			author: interaction.member.id,
			agent: interaction.member.id,
			department: "Development"
		}).save();
		await interaction.followUp({embeds: new EmbedBuilder().setColor("#2b2d31").setDescription("Saved"), ephemeral: true});
	},
};
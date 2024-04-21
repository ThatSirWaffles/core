const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder
} = require("discord.js");

const {
	info
} = require("../../config.json")



module.exports = {
	category: 'dev',
	data: data = new SlashCommandBuilder()
		.setName("template")
		.setDescription("Sends a template")
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName("name")
				.setDescription("The template to send")
				.setRequired(true)
				.addChoices(
					{name: 'support', value: 'support'}
				)),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});
		const template = interaction.options.getString('name', true)
		if (template == "support") {
			interaction.followUp(info+" Broken for now :/")
		}
	},
};
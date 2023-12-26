const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("flightform")
		.setDescription("Creates a new flight form")
		.addStringOption(option =>
			option.setName("code")
				.setDescription("The form's flight code (SKR/D-XXX)")
				.setRequired(true)),
	async execute(interaction) {
		const code = interaction.options.getString("code");

		if (new RegExp("^(SKR-\d{3}|D-\d{3})$").test(code)) {
			await interaction.reply({content: "is fine", ephemeral: true});
		} else {
			await interaction.reply({content: "isn't fine", ephemeral: true});
		}
	},
};
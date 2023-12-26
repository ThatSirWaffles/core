const {
	SlashCommandBuilder,
	EmbedBuilder
} = require("discord.js");

module.exports = {
	data: data = new SlashCommandBuilder()
		.setName("panelsetup")
		.setDescription("Set up the panel channel")
		.setDefaultMemberPermissions(),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});
		const exampleEmbed = new EmbedBuilder()
			.setColor("#002244")
			.setTitle("Bot Control Panels")
			.setDescription(`You'll find here most controls for the bot's systems. Some panels show "live" information, but to update the data, please press the refresh buttons associated to them. For support or suggestions, DM <@652103654559449088>.`)

		await interaction.channel.send({ embeds: [exampleEmbed] });
		await interaction.followUp("<:skdloadfinishedstatic:1051195893703004190> **Done**");
	},
};
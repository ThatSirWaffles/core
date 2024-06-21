const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ActivityType
} = require("discord.js");

const {
	info
} = require("../../config.json");
const { System } = require("../../handlers/database");



module.exports = {
	category: 'admin',
	data: data = new SlashCommandBuilder()
		.setName("status")
		.setDescription("Updates the bot's status")
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName("status")
				.setDescription("The status to change to")
				.setRequired(true)
			),
	async execute(interaction) {
		const status = interaction.options.getString('status', true);
		const sys = await System.findOne();

		sys.botStatus = status;
		sys.save();
		client.user.setActivity(status, {type: ActivityType.Watching});

		interaction.reply({content: "Changed status to watching "+status, ephemeral: true})
	},
};
const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ActivityType
} = require("discord.js");

const {
	info,
	success
} = require("../../config.json");
const { User } = require("../../handlers/database");



module.exports = {
	category: 'dev',
	data: data = new SlashCommandBuilder()
		.setName("update")
		.setDescription("Updates a user's roles")
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName("user")
				.setDescription("The user to update")
				.setRequired(true)
			),
	async execute(interaction) {
		const user = interaction.options.getString('user', true);
		const profile = await User.findOne({'discord.id': user.id});

		client.user.setActivity(status, {type: ActivityType.Watching});

		interaction.reply({content: success+" Updated roles", ephemeral: true})
	},
};
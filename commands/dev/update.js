const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ActivityType,
	AuditLogEvent
} = require("discord.js");

const {
	info,
	success
} = require("../../config.json");
const { User } = require("../../handlers/database");
const { updateRoles } = require("../public/verify");



module.exports = {
	category: 'dev',
	data: data = new SlashCommandBuilder()
		.setName("update")
		.setDescription("Updates a user's roles")
		.setDefaultMemberPermissions(0)
		.addUserOption(option =>option
			.setName("user")
			.setDescription("The user to update")
			.setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const profile = await User.findOne({'discord.id': user.id});
		const member = await mainguild.members.fetch(user.id);

		updateRoles(profile, member);

		interaction.reply({content: success+" Updated roles", ephemeral: true});
	},
};
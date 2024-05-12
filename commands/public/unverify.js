const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const {info, success, fail, rolesets} = require("../../config.json");
const { User } = require('../../handlers/database');

module.exports = {
	category: 'public',
	data: new SlashCommandBuilder()
		.setName("unverify")
		.setDescription("Disconnect your Discord and Roblox accounts"),
	async execute(interaction) {
		const result = await User.findOne({'discord.id': interaction.user.id});

		if (result) {
			const prev = result.roblox.name

			result.discord = undefined;
			result.save();

			interaction.member.setNickname("");

			interaction.reply({
				embeds: [
					new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(success+` Disconnected your Discord account from \`\`\`${prev}\`\`\``)
				],
				ephemeral: true
			})
		} else {
			interaction.reply({
				embeds: [
					new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(info+` Your Discord account isn't verified yet, nothing to remove`)
				],
				ephemeral: true
			})
		}
	},
};
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const {info, success, fail, rolesets} = require("../../config.json");
const { User } = require('../../handlers/database');

module.exports = {
	category: 'public',
	data: new SlashCommandBuilder()
		.setName("unverify")
		.setDescription("Disconnect your Discord and Roblox accounts, clears Discord-related data"),
	async execute(interaction) {
		const result = await User.findOne({'discord.id': interaction.user.id});

		if (result) {
			const prev = result.roblox.name

			client.channels.cache.get("994709325186600980").send(`${interaction.user.username}, ID ${interaction.user.id} has unverified ${prev} with the following data: \`\`\`${result.discord}\`\`\``)

			result.discord = undefined;
			result.save();

			interaction.member.setNickname("")
			.catch(() => {})

			interaction.reply({
				embeds: [
					new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(success+` Disconnected your Discord account from **${prev}**.\n\n*All Discord-related data associated with this account has been wiped. It can be recovered by DMing <@652103654559449088> if needed.*`)
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
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const {info, success, fail, rolesets} = require("../../config.json");
const { User } = require('../../handlers/database');
var pluralize = require('pluralize')

module.exports = {
	category: 'public',
	data: new SlashCommandBuilder()
		.setName("profile")
		.setDescription("View your Skyrden profile")
		.addUserOption(option => option
			.setName("user")
			.setDescription("User to view the profile of")
			.setRequired(false)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user') ?? interaction.user

		const profile = await User.findOne({'discord.id': user.id});

		if (profile) {
			const img = (await (await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${profile.roblox.id}&size=420x420&format=Png&isCircular=true`)).json()).data[0].imageUrl;

			var embed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setTitle(profile.roblox.nick == profile.roblox.name ? profile.roblox.name : `${profile.roblox.nick} (@${profile.roblox.name})`)
			.setURL("https://www.roblox.com/users/"+profile.roblox.id)
			.setDescription(
`- **Skyrden ID:** ${profile.userId}
- **Skyrbux:** ${profile.skyrbux}
- **Attended:** ${pluralize("flight", profile.flightsAttended, true)}${profile.discord ? "\n- **Streak:** "+pluralize("day", profile.discord.streak, true) : ""}`
			)

			var cards = await (await fetch(`https://api.skyrden.com/users/cards/`+profile.roblox.id)).json()
			if (cards.length) {	
				embed.addFields({name: "Cards", value: cards.map(value => `- ${value}`).join('\n'), inline: true})
			}

			if (img.startsWith("https://")) {
				embed.setThumbnail(img)
			}

			interaction.reply({
				embeds: [
					embed
				]
			})
		} else {
			interaction.reply({
				embeds: [
					new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(info+(interaction.options.getUser('user') ? `This user doesn't have a profile on Skyrden yet` : ` You don't have a profile. Link your account by running </verify:1239031118963933184>.`))
				],
				ephemeral: true
			})
		}
	},
};
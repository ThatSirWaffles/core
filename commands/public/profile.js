const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const {info, success, fail, rolesets} = require("../../config.json");
const { User } = require('../../handlers/database');

module.exports = {
	category: 'public',
	data: new SlashCommandBuilder()
		.setName("profile")
		.setDescription("View your Skyrden profile"),
	async execute(interaction) {
		const profile = await User.findOne({'discord.id': interaction.user.id});

		if (profile) {
			var embed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setTitle(profile.roblox.nick == profile.roblox.name ? profile.roblox.name : `${profile.roblox.nick} (@${profile.roblox.name})`)
			.setURL("https://www.roblox.com/users/"+profile.roblox.id)
			.setThumbnail((await (await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${profile.roblox.id}&size=420x420&format=Png&isCircular=true`)).json()).data[0].imageUrl)
			.setDescription(
`- **Skyrden ID:** ${profile.userId}
- **Skyrbux:** ${profile.skyrbux}
- **Flights attended:** ${profile.flightsAttended}${profile.discord ? "\n- **Streak:** "+profile.discord.streak : ""}`
			)

			var cards = await (await fetch(`https://api.skyrden.com/users/cards/`+profile.roblox.id)).json()
			if (cards.length) {	
				embed.addFields({name: "Cards", value: cards.map(value => `- ${value}`).join('\n'), inline: true})
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
					.setDescription(info+` You don't have a profile. Link your account by running </verify:1239031118963933184>.`)
				]
			})
		}
	},
};
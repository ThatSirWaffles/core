const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const {info, success, fail, rolesets} = require("../../config.json");
const { User } = require('../../handlers/database');

async function updateRoles(profile, member) {
	const groups = (await (await fetch(`https://groups.roblox.com/v1/users/${profile.roblox.id}/groups/roles`)).json()).data;
	const obj = groups.find(obj => obj.group.id == 12253448)

	if (obj && obj.role.rank > 1) {
		for (let id in rolesets) {
			const role = mainguild.roles.cache.get(rolesets[id]);
			if (role && member.roles.cache.has(rolesets[id])) {
				member.roles.remove(rolesets[id]);
			}
		}

		if (member.roles.cache.has("900946036124680193")) {
			member.roles.remove("900946036124680193");
		}

		if (obj.role.rank > 28) {
			member.roles.add(mainguild.roles.cache.get("891341478129963030"));
		} else if (obj.role.rank <= 8) {
			member.roles.add(mainguild.roles.cache.get(rolesets[obj.role.rank.toString()]));
		}

		member.roles.add(mainguild.roles.cache.get("900798313085952051"));

		return true
	} else {
		for (let id in rolesets) {
			const role = mainguild.roles.cache.get(rolesets[id]);
			if (role && member.roles.cache.has(rolesets[id])) {
				member.roles.remove(rolesets[id]);
			}
		}

		if (member.roles.cache.has("900798313085952051")) {
			member.roles.remove("900798313085952051");
		}

		member.roles.add(mainguild.roles.cache.get("900946036124680193"));

		return false
	}
}

module.exports = {
	category: 'public',
	data: new SlashCommandBuilder()
		.setName("verify")
		.setDescription("Verify your Roblox account"),
	async execute(interaction) {
		const result = await User.findOne({'discord.id': interaction.user.id});

		if (result) {
			await interaction.deferReply({ephemeral: true});

			const output = await updateRoles(result, interaction.member)

			interaction.followUp({
				embeds: [
					new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(output ? success+` Updated your profile` : fail+` You aren't in our group, please join it [here](https://www.roblox.com/groups/12253448/Skyrden#!/about) and wait for approval.`)
				],
				ephemeral: true
			})
		} else {
			if (verifCodes.some(obj => obj.userid == interaction.user.id)) {
				verifCodes = verifCodes.filter(obj => obj.userid !== interaction.user.id);
			}
			
			const code = Math.floor(1000 + Math.random() * 9000).toString()
	
			const timeoutRef = setTimeout(() => {
				verifCodes = verifCodes.filter(obj => obj.code !== code);
			}, 5 * 60 * 1000);
	
			verifCodes.push({userid: interaction.user.id, username: interaction.user.username, code: code, ref: timeoutRef})
	
			interaction.reply({
				embeds: [
					new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(`**${info} Please do not share this code with anyone**\`\`\`${code}\`\`\`\n*Expires <t:${Math.floor(Date.now() / 1000) + (5 * 60)}:R>*`)
				],
				ephemeral: true
			})
		}
	},
	updateRoles
};
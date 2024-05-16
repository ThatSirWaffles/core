const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const {info, success, fail, rolesets, mainguildid, roverkey} = require("../../config.json");
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

		member.setNickname((profile.roblox.nick == profile.roblox.name || `${profile.roblox.nick} (@${profile.roblox.name})`.length > 32) ? profile.roblox.name : `${profile.roblox.nick} (@${profile.roblox.name})`)
		.catch(() => {})
		
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

		member.setNickname("")
		.catch(() => {})

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
			
			const probableUser = await (await fetch(`https://registry.rover.link/api/guilds/${mainguildid}/discord-to-roblox/${interaction.user.id}`, {headers:{Authorization: roverkey}})).json()

			var draft = {
				embeds: [
					new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(`- Join the [hub](https://www.roblox.com/games/15895614122/Skyrden-Hub)\n- Click on the **Verify** button under **Discord**\n\n**${info} Please do not share this code with anyone**\`\`\`${code}\`\`\`\n*Expires <t:${Math.floor(Date.now() / 1000) + (5 * 60)}:R>*`
									+(probableUser.robloxId ? `\n\nYou seem to have linked **${probableUser.cachedUsername}** with RoVer. You can use this account by clicking the button below. If it isn't correct, you can change it [here](https://rover.link/verify), or verify with the instructions given above.` : "\n\nIf you would rather verify with RoVer, you can do so [here](https://rover.link/verify) and run this command again."))
				],
				ephemeral: true,
			}

			if (probableUser.robloxId) {
				const roverbutton = new ButtonBuilder()
					.setCustomId(`roverVerification|${probableUser.robloxId}`)
					.setLabel("Verify with RoVer")
					.setStyle(ButtonStyle.Secondary)
				
					draft.components = [new ActionRowBuilder().addComponents(roverbutton)]
			}

			interaction.reply(draft)
		}
	},
	updateRoles
};
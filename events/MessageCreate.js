const { Events, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const {info, success, fail, depts} = require("../../config.json")

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
		if (!message.guild && message.author.id != client.user.id) {
			const deptpicker = new StringSelectMenuBuilder()
				.setCustomId("deptpicker")
				.setPlaceholder('Select a department')
	
			for (const dept of depts) {
				deptpicker.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel(dept.name)
						.setDescription(dept.description)
						.setEmoji(dept.emoji)
						.setValue(dept.name)
				)
			}

			message.reply({
				allowedMentions: { repliedUser: false },
				components: [
					new ActionRowBuilder().addComponents(deptpicker)
				],
				embeds: [
					new EmbedBuilder()
					.setColor("#2b2d31")	
					.setDescription(info+" Please only use my DMs to open a ticket. This first message will be ignored. **Select a department to contact:**")
				]
			});

			const collectorFilter = i => {
				i.deferUpdate();
				return i.user.id === interaction.user.id;
			};
			

			message.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.StringSelect, time: 20000 })
			.then(async collected => {
				const selectedflight = flights.filter(obj => obj.id == collected.values[0])[0];

				const host = (await (await fetch("https://staff.skyrden.com/api/v1/staff?robloxId[eq]="+selectedflight.host)).json()).data[0];

				var classemojis = ""

				if (selectedflight.aircraft.modelId != null) {
					if (selectedflight.aircraft.premiumPlus != 0) {
						classemojis += " <:skrprp:1059119094789582943>"
					}
					if (selectedflight.aircraft.premium != 0) {
						classemojis += " <:skrpr:1202940106084847647>"
					}
					if (selectedflight.aircraft.economyPlus != 0) {
						classemojis += " <:skrecp:1059119096899313674>"
					}
					if (selectedflight.aircraft.economy != 0) {
						classemojis += " <:skrec:1059119098405072938>"
					}
				}
				
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setColor("#2b2d31")
						.setTitle(selectedflight.flightNumber)
						.setDescription(`<:host:1203078647699742740> <@${host.discordId}>\n\n<:aircraft:1203078640871677982> \`${selectedflight.aircraft.name}\`${classemojis}\n\n<:gate:1203078645619621919> \`${selectedflight.airport.gate}\`\n<:origin:1203078648912150558> \`${selectedflight.airport.name}\`\n<:destination:1203078644319133767> \`${selectedflight.airport.destination}\`\n\n<:time:1203078650241744996> <t:${selectedflight.date}:t> <t:${selectedflight.date}:R>\n<:day:1203078643128082442> <t:${selectedflight.date}:D>`)
					],
					components: []
				})	
			})
			.catch(() => {
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setColor("#2b2d31")	
						.setDescription(fail+" *Timed out*")
					],
					components: []
				})
			});
		}
	},
};
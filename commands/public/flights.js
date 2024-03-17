const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const {info, success, fail} = require("../../config.json")


module.exports = {
	category: 'public',
	data: new SlashCommandBuilder()
		.setName("flights")
		.setDescription("View scheduled flights"),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});

		const response = await fetch("https://staff.skyrden.com/api/v1/flights?status[eq]=scheduled");
		const data = await response.json();
		const flights = data.data;

		if (flights.length == 0) { 
			await interaction.followUp({embeds: new EmbedBuilder().setColor("002244").setDescription("No flights scheduled, check back later"), ephemeral: true});
		} else {
			var emoji
	
			const flightpicker = new StringSelectMenuBuilder()
				.setCustomId("flightpicker")
				.setPlaceholder('Select a flight')
	
			for (const flight of flights) {
				if (flight.flightNumber.includes("SKR")) {
					emoji = "1160343438290595900";
				} else {
					emoji = "1160343441474060398";
				};
	
				flightpicker.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel(flight.flightNumber)
						.setDescription(`On ${new Intl.DateTimeFormat('en-GB').format(new Date(flight.date*1000))} from ${flight.airport.name}`)
						.setEmoji(emoji)
						.setValue(String(flight.id))
				)
			}

			const message = await interaction.followUp({
				components: [
					new ActionRowBuilder().addComponents(flightpicker)
				],
				ephemeral: true
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
			.catch((err) => {
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setColor("#2b2d31")	
						.setDescription(info+" *Timed out*")
					],
					components: []
				})
			});
		}
	},
};
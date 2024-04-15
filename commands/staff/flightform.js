const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, Embed, ComponentType, GuildScheduledEventPrivacyLevel, GuildScheduledEventManager, GuildScheduledEventEntityType, ButtonBuilder, ButtonStyle } = require('discord.js');
const {info, success, fail, externalkey} = require("../../config.json")

module.exports = {
	category: 'staff',
	data: new SlashCommandBuilder()
		.setName("flightform")
		.setDescription("Create a new flight form"),
	async execute(interaction) {
		if (!interaction.member.roles.cache.some(role => role.id == "891436167034204171")) {
				interaction.reply({
					ephemeral: true,
					embeds: [
						new EmbedBuilder()
						.setColor("#2b2d31")	
						.setDescription(fail+" *Not allowed! Restricted to <@&891436167034204171>*")
					]
				})
		} else {
			await interaction.deferReply({ephemeral: true});

			const response = await fetch("https://staff.skyrden.com/api/v1/flights?status[eq]=scheduled");
			const data = await response.json();
			const flights = data.data;

			if (flights.length == 0) { 
				await interaction.followUp({embeds: new EmbedBuilder().setColor("#2b2d31").setDescription("No flights scheduled on the [staff hub](https://staff.skyrden.com)"), ephemeral: true});
			} else {
				var emoji
		
				const flightpicker = new StringSelectMenuBuilder()
					.setCustomId("flightformpicker")
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
					fetch(`http://localhost:8010/createflightform/${collected.values[0]}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: externalkey})})
						.then(() => interaction.deleteReply())
						.catch(error => {
							interaction.followUp({ content: fail+` Failed, please report the bug to @sirwaffles\`\`\`${error}\`\`\``, ephemeral: true });
						});
				})
				.catch(() => {
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
		}
	},
};
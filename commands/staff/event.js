const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, Embed, ComponentType, GuildScheduledEventPrivacyLevel, GuildScheduledEventManager, GuildScheduledEventEntityType, GuildScheduledEventStatus } = require('discord.js');
const { mainguildid, info, success, fail, eventannouncements, flightlist } = require("../../config.json")

module.exports = {
	category: 'staff',
	data: new SlashCommandBuilder()
		.setName("event")
		.setDescription("Creates a new Discord event for flights"),
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
					.setCustomId("eventpicker")
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

					const username = await (await fetch("https://users.roblox.com/v1/users/"+selectedflight.host)).json();

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
					
					const eventmanager = new GuildScheduledEventManager(mainguild)

					eventmanager.create({
						name: selectedflight.flightNumber,
						scheduledStartTime: new Date(selectedflight.date*1000),
						scheduledEndTime: new Date(selectedflight.date*1000+3600000),
						privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
						entityType: GuildScheduledEventEntityType.External,
						description: `<:skdflying:1044002420935635105> \`${selectedflight.aircraft.name}\`${classemojis}\n<:skdtakeoff:1044002090231549992> \`${selectedflight.airport.name}\`\n<:skdlanding:1044002105431695370> \`${selectedflight.airport.destination}\`\n<:skdperson:1044002126910726164> \`${username.name}\``,
						entityMetadata: {location: "https://skyrden.com/"+selectedflight.airport.name.toLowerCase()},
						image: null,
					}).then(event => {
						interaction.editReply({
							embeds: [
								new EmbedBuilder()
								.setColor("#2b2d31")
								.setDescription(`Created event [here](${event.url})`)
							],
							components: []
						})

						client.channels.cache.get(eventannouncements).messages.fetch(flightlist)
						.then(async message => {
							events = await eventmanager.fetch();

							message.edit({content: "||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| _ _ _ _ _ _"+events.filter(event => event.status === GuildScheduledEventStatus.Scheduled && event.description.includes("1044002420935635105")).map(event => event.url).join("\n"), embeds: []})
						})
					});
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
		}
	},
};
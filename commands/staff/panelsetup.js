const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ButtonBuilder,
	ButtonStyle
} = require("discord.js");
var plural = require("pluralize");

module.exports = {
	category: 'staff',
	data: data = new SlashCommandBuilder()
		.setName("panelsetup")
		.setDescription("Set up the panel channel")
		.setDefaultMemberPermissions(),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});

		var flights = {}
		var emoji

		try {
			var response = await fetch("https://api.skyrden.com/flights");
			flights = await response.json();
		} catch (error) {
			console.error("Error fetching flights:", error);
		}

		const flightpicker = new StringSelectMenuBuilder()
			.setCustomId('flightpicker')
			.setPlaceholder('Select a flight')

		for (const flight of flights) {
			if (flight.Flight_Number.includes("SKR")) {
				emoji = "1160343438290595900";
			} else {
				emoji = "1160343441474060398";
			};

			flightpicker.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(flight.Flight_Number)
					.setDescription(`On ${flight.Date} from ${flight.Origin}`)
					.setEmoji(emoji)
					.setValue(flight.Flight_Number)
			)
		}

		const refresh = new ButtonBuilder()
			.setCustomId("refreshflights")
			.setStyle(ButtonStyle.Secondary)
			.setLabel("Refresh")

		const infoembed = new EmbedBuilder()
			.setColor("#002244")
			.setTitle("Bot Control Panels")
			.setDescription(`You'll find here most controls for the bot's systems. Some panels show "live" information, but to update the data, please press the refresh buttons associated to them.\n\n*For support or suggestions, DM <@652103654559449088>*`)
		const flightformembed = new EmbedBuilder()
			.setColor("#ffd500")
			.setTitle("New Flight Form")
			.setDescription(`For use by event managers. Creates a new <#889184813175689226>. Select a flight from the dropdown to get started.`)

		const flightformrow = new ActionRowBuilder()
			.addComponents(flightpicker)

		const refreshrow = new ActionRowBuilder()
			.addComponents(refresh)

		await interaction.channel.send({embeds: [infoembed]});
		await interaction.channel.send({embeds: [flightformembed], components: [flightformrow, refreshrow]});
		await interaction.followUp("<:skdloadfinishedstatic:1051195893703004190> **Done**");
	},
};
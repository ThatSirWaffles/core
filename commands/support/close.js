const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ComponentType
} = require("discord.js");

const {
	info,
	fail,
	depts,
	logchannelid
} = require("../../config.json")

const {Ticket} = require("../../handlers/database.js");

const discordTranscripts = require('discord-html-transcripts');

module.exports = {
	category: 'support',
	data: data = new SlashCommandBuilder()
		.setName("close")
		.setDescription("Closes a ticket"),
	async execute(interaction) {
		if (interaction.channel.parent && depts.some(dept => dept.id == interaction.channel.parent.id)) {
			const confirmbutton = new ButtonBuilder()
				.setCustomId("confirm")
				.setLabel("Confirm")
				.setStyle(ButtonStyle.Danger)

			const cancelbutton = new ButtonBuilder()
				.setCustomId("cancel")
				.setLabel("Cancel")
				.setStyle(ButtonStyle.Secondary)

			const message = await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor("#2b2d31")	
						.setDescription(info+" *Are you sure you want to close this ticket?*")
				],
				components: [new ActionRowBuilder().addComponents(confirmbutton, cancelbutton)],
				ephemeral: true
			});

			const collectorFilter = i => {
				i.deferUpdate();
				return i.user.id === interaction.user.id;
			};

			message.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 10000 })
			.then(async i => {
				if (i.customId == "confirm") {
					const result = await Ticket.findOne({channel: interaction.channel.id});

					if (result) {
						client.users.cache.get(result.author).send({
							embeds: [
								new EmbedBuilder()
								.setColor("#2b2d31")	
								.setDescription(info +` *Your ticket has been closed. You can request a transcript by contacting us and citing this ticket ID: \`${result._id}\`*\n\nThank you for contacting us, and don't hesitate to open a new ticket if you require further support.`)
							]
						});
						
						const attachment = await discordTranscripts.createTranscript(interaction.channel, {
							filename: `transcript-${result._id}.html`,
							saveImages: true,
							footerText: "Ticket ID "+result._id, // Change text at footer, don't forget to put {number} to show how much messages got exported, and {s} for plural
							poweredBy: false, // Whether to include the "Powered by discord-html-transcripts" footer
						});

						client.channels.cache.get(logchannelid).send({
							embeds: [
								new EmbedBuilder()
								.setColor("#2b2d31")
								.setDescription(`- Ticket ID: \`${result._id}\`\n- Closed by: ${interaction.user}`)
							],
							files: [attachment]
						});
		
						await result.deleteOne();
					}

					interaction.channel.delete();
				} else {
					message.delete();
				}
			})
			.catch(e => {
				console.log(e)
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")	
							.setDescription(fail+" *Timed out*")
					],
					components: []
				});
			});
		} else {
			interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor("#2b2d31")	
						.setDescription(fail+" *Not a valid ticket*")
				],
				ephemeral: true
			});
		}
	},
};
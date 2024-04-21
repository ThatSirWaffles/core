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
	depts	
} = require("../../config.json")

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
			.then(i => {
				if (i.customId == "confirm") {
					interaction.channel.delete();
				} else {
					message.delete();
				}
			})
			.catch(() => {
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
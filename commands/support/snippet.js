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
	logchannelid,
	snippets
} = require("../../config.json")

const {Ticket} = require("../../handlers/database.js");

function trunc(str, maxLength) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + "...";
    } else {
        return str;
    }
}

module.exports = {
	category: 'support',
	data: data = new SlashCommandBuilder()
		.setName("snippet")
		.setDescription("Shorthands for long messages")
		.addStringOption(option =>
			option.setName("snippet")
				.setDescription("The snippet to send")
				.setRequired(true)
				.addChoices(...snippets.map(item => ({name: item.name, value: item.name})))),
	async execute(interaction) {
		if (interaction.channel.parent && depts.some(dept => dept.id == interaction.channel.parent.id)) {
			console.log(interaction.channelId)
			const result = await Ticket.findOne({channel: interaction.channelId});

			if (result) {
				const val = snippets.find(obj => obj.name == interaction.options.getString('snippet', true)).value

				client.users.cache.get(result.author).send({
					embeds: [
						new EmbedBuilder()
						.setColor("#2b2d31")	
						.setDescription(val)
						.setAuthor({name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.avatarURL()})
						.setTimestamp()
						.setFooter({text: "Support Agent"})
					]
				});

				interaction.reply({
					embeds: [
						new EmbedBuilder()
						.setColor("#7c4f8f")
						.setDescription(val)
						.setAuthor({name: `${interaction.user.globalName} (@${interaction.user.username})`, iconURL: interaction.user.avatarURL()})
						.setTimestamp()
						.setFooter({text: "Support Agent"})
					]
				});
			}
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
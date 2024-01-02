const {
	SlashCommandBuilder,
	EmbedBuilder
} = require("discord.js");

module.exports = {
	category: 'dev',
	data: data = new SlashCommandBuilder()
		.setName("reload")
		.setDescription("Reloads a specific command")
		.setDefaultMemberPermissions()
		.addStringOption(option =>
			option.setName("command")
				.setDescription("The command to reload")
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.followUp(`There is no command with name \`${commandName}\`!`);
		}

		delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

		try {
			interaction.client.commands.delete(command.data.name);
			const newCommand = require(`../${command.category}/${command.data.name}.js`);
			interaction.client.commands.set(newCommand.data.name, newCommand);
			await interaction.followUp(`Command \`${newCommand.data.name}\` was reloaded!`);
		} catch (error) {
			console.error(error);
			await interaction.followUp(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
		}
	},
};
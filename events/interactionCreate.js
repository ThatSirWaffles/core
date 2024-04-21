const { Events, ModalBuilder, EmbedBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const {info, success, fail, staffhubkey, externalkey} = require("../config.json")

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {

			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: fail+` Failed, please report the bug to @sirwaffles\`\`\`${error}\`\`\``, ephemeral: true });
				} else {
					await interaction.reply({ content: fail+` Failed, please report the bug to @sirwaffles\`\`\`${error}\`\`\``, ephemeral: true });
				}
			}

		} else if (interaction.isButton()) {

			const args = interaction.customId.split("|");
			if (args[0] == "joinflight") {
				const signups = (await (await fetch("https://staff.skyrden.com/api/v1/signups/flights?flightId="+args[1], {headers:{Authorization: staffhubkey}})).json()).data;

				if (signups.some(obj => obj.staff.discordId == interaction.user.id)) {
					await interaction.reply({embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")
							.setDescription(info+" You're already on this flight")
					],
					ephemeral: true});
				} else {
					const modal = new ModalBuilder()
						.setCustomId("joinflight")
						.setTitle("Join Flight");

					modal.addComponents(new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("preferredrole")
							.setLabel("Preferred Role")
							.setPlaceholder("Leave empty if you have no preference")
							.setStyle(TextInputStyle.Short)
							.setRequired(false)
					));

					await interaction.showModal(modal);

					interaction.awaitModalSubmit({filter: async (i) => i.user.id === interaction.user.id, time: 60000})
					.then(async modalInteraction => {
						const staff = (await (await fetch("https://staff.skyrden.com/api/v1/staff?discordId[eq]="+modalInteraction.user.id)).json()).data[0];
						var body = {flightId: parseInt(args[1]), staffId: staff.id}

						if (modalInteraction.fields.fields.get("preferredrole").value != "") {
							body.preferedRole = modalInteraction.fields.fields.get("preferredrole").value
						}

						fetch('https://staff.skyrden.com/api/v1/signups/flights', {method: "POST", body: JSON.stringify(body), headers:{"Content-Type": "application/json", Authorization: staffhubkey}})
						.then(async () => {
							fetch(`http://localhost:8010/updateflightform/${args[1]}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: externalkey})})
							.then(() => {
								interaction.followUp({embeds: [
									new EmbedBuilder()
										.setColor("#2b2d31")
										.setDescription(success+`Added to **${interaction.message.embeds[0].title}**`)
								],
								ephemeral: true});
							})
							.catch(error => {
								error(error);
							});
						})
						.catch(err => {
							modalInteraction.reply({embeds: [
								new EmbedBuilder()
									.setColor("#2b2d31")
									.setDescription(fail+` Failed, please report the bug to @sirwaffles\`\`\`${err}\`\`\``)
							],
							ephemeral: true});
						})
					})
					.catch(() => {
						interaction.reply({embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")	
							.setDescription(fail+" *Timed out*")
						],
						ephemeral: true})
					})
				}
			} else if (args[0] == "leaveflight") {
				await interaction.deferReply({ephemeral: true});
				const signups = (await (await fetch("https://staff.skyrden.com/api/v1/signups/flights?flightId="+args[1], {headers:{Authorization: staffhubkey}})).json()).data;

				if (signups.some(obj => obj.staff.discordId == interaction.user.id)) {
					fetch('https://staff.skyrden.com/api/v1/signups/flights/'+signups.filter(obj => obj.staff.discordId == interaction.user.id)[0].id, {method: "DELETE", headers:{Authorization: staffhubkey}})
					.then(async () => {
						fetch(`http://localhost:8010/updateflightform/${args[1]}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: externalkey})})
						.then(() => {
							interaction.followUp({embeds: [
								new EmbedBuilder()
									.setColor("#2b2d31")
									.setDescription(success+` Removed from **${interaction.message.embeds[0].title}**`)
							],
							ephemeral: true});
						})
						.catch(error => {
							error(error);
						});
					})
					.catch(err => {
						interaction.followUp({embeds: [
							new EmbedBuilder()
								.setColor("#2b2d31")
								.setDescription(fail+` Failed, please report the bug to @sirwaffles\`\`\`${err}\`\`\``)
						],
						ephemeral: true});
					});
				} else {
					await interaction.followUp({embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")
							.setDescription(info+" You're not on this flight")
					],
					ephemeral: true});
				}
			} else if (args[0] == "refreshflight") {
				interaction.deferReply({ephemeral: true});
				fetch(`http://localhost:8010/updateflightform/${args[1]}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: externalkey})})
				.then(() => interaction.deleteReply())
				.catch(err => {
					interaction.followUp({embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")
							.setDescription(fail+` Failed, please report the bug to @sirwaffles\`\`\`${err}\`\`\``)
					],
					ephemeral: true});
				});
			}
		}
	},
};
const { Events, ModalBuilder, EmbedBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const {info, success, fail, staffhubkey, externalkey, botkey} = require("../config.json");
const { Ban, User } = require('../handlers/database');

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
				const signups = (await (await fetch("https://staff.skyrden.com/api/v1/signups/flights?flightId="+args[1], {"Content-Type": "application/json", headers:{Authorization: staffhubkey}})).json()).data;

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
						.then(async res => {
							fetch(`http://localhost:8010/updateflightform/${args[1]}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: externalkey})})
							.then(() => {
								modalInteraction.reply({embeds: [
									new EmbedBuilder()
										.setColor("#2b2d31")
										.setDescription(success+`Added to **${interaction.message.embeds[0].title}**`)
								],
								ephemeral: true});
							})
							.catch(error => {
								throw new Error(error);
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
						interaction.followUp({embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")	
							.setDescription(fail+" *Timed out*")
						],
						ephemeral: true})
					})
				}
			} else if (args[0] == "leaveflight") {
				await interaction.deferReply({ephemeral: true});
				const signups = (await (await fetch("https://staff.skyrden.com/api/v1/signups/flights?flightId="+args[1], {"Content-Type": "application/json", headers:{Authorization: staffhubkey}})).json()).data;

				if (signups.some(obj => obj.staff.discordId == interaction.user.id)) {
					fetch('https://staff.skyrden.com/api/v1/signups/flights/'+signups.filter(obj => obj.staff.discordId == interaction.user.id)[0].id, {method: "DELETE", headers:{"Content-Type": "application/json", Authorization: staffhubkey}})
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
							throw new Error(error);
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
			} else if (args[0] == "confirmAutoRank") {
				interaction.deferReply({ephemeral: true});
				fetch(`http://localhost:8000/rank/${args[1]}/5`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: botkey})})
				.then(() => {
					interaction.deleteReply();
					interaction.message.delete();
					client.channels.cache.get("994709325186600980").send(`${interaction.user.username} manually ranked [${args[2]}](<https://www.roblox.com/users/${args[1]}/profile>) to EC (${Math.round(args[3] / (1000 * 3600 * 24))} days old)`);
				})
				.catch(err => {
					interaction.followUp({embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")
							.setDescription(fail+` Failed, please report the bug to @sirwaffles\`\`\`${err}\`\`\``)
					],
					ephemeral: true});
				});
			} else if (args[0] == "kickAutoRank") {
				interaction.deferReply({ephemeral: true});
				fetch(`http://localhost:8000/kick/${args[1]}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: botkey})})
				.then(() => {
					interaction.deleteReply();
					interaction.message.delete();
					client.channels.cache.get("994709325186600980").send(`${interaction.user.username} manually kicked [${args[2]}](<https://www.roblox.com/users/${args[1]}/profile>) (${Math.round(args[3] / (1000 * 3600 * 24))} days old)`);
				})
				.catch(err => {
					interaction.followUp({embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")
							.setDescription(fail+` Failed, please report the bug to @sirwaffles\`\`\`${err}\`\`\``)
					],
					ephemeral: true});
				});
			} else if (args[0] == "banAutoRank") {
				const modal = new ModalBuilder()
					.setCustomId('banAutoRank')
					.setTitle('Ban '+args[2]);

				const reasonInput = new TextInputBuilder()
					.setCustomId('reasonInput')
					.setLabel("Reason for ban")
					.setStyle(TextInputStyle.Paragraph);

				modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

				await interaction.showModal(modal);
				
				interaction.awaitModalSubmit({filter: async (i) => i.user.id === interaction.user.id, time: 60000})
				.then(async modalInteraction => {
					Ban.create({
						date: Date.now(),
						author: interaction.user.id,
						victim: args[1],
						reason: modalInteraction.fields.getTextInputValue("reasonInput")
					});

					modalInteraction.deferReply();
					modalInteraction.deleteReply();
	
					fetch(`http://localhost:8000/kick/${args[1]}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: botkey})})
					.then(() => {
						interaction.message.delete();
						client.channels.cache.get("994709325186600980").send(`${interaction.user.username} banned [${args[2]}](<https://www.roblox.com/users/${args[1]}/profile>) (${Math.round(args[3] / (1000 * 3600 * 24))} days old). Contact @sirwaffles to undo.`);
					})
					.catch(err => {
						interaction.followUp({embeds: [
							new EmbedBuilder()
								.setColor("#2b2d31")
								.setDescription(fail+` Failed, please report the bug to @sirwaffles\`\`\`${err}\`\`\``)
						],
						ephemeral: true});
					});
				})
				.catch(e => {
					interaction.followUp({embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")	
							.setDescription(fail+" *Timed out*")
						],
						ephemeral: true}
					);
				})
			} else if (args[0] == "roverVerification") {
				var result = await User.findOne({'roblox.id': args[1]});

				if (!result) {
					const username = await (await fetch("https://users.roblox.com/v1/users/"+args[1])).json();
					const sys = await System.findOne();

					result = User.create({
						roblox: {
							id: args[1],
							name: username.name,
							nick: username.displayName
						},
						userId: sys.userCounter,
						skyrbux: 0,
						flightsAttended: 0,
						discord: {
							id: interaction.user.id,
							name: interaction.user.username,
							streak: 0,
							lastStreak: 0
						}
					});

					sys.userCounter += 1;
					await sys.save();
				} else {
					result.discord = {
						id: interaction.user.id,
						name: interaction.user.username,
						streak: 0,
						lastStreak: 0
					};
					await result.save();
				}

				var result = await User.findOne({'roblox.id': args[1]});

				interaction.reply({embeds: [
					new EmbedBuilder()
						.setColor("#2b2d31")
						.setDescription(success+` Verified **${result.roblox.name}** with RoVer successfully`)
				],
				ephemeral: true});
			}
		}
	},
};
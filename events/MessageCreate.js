const { Events, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const {info, success, fail, depts, supportguildid} = require("../config.json")
const {Ticket} = require("../handlers/database.js");
const { time } = require('console');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.id != client.user.id) {
			if (!message.guild) {
				const result = await Ticket.findOne({author: message.author.id});
				if (result) {
					if (client.channels.cache.get(result.channel)) {
						client.channels.cache.get(result.channel).send({
							embeds: [
								new EmbedBuilder()
								.setColor("#f0a21d")	
								.setDescription(message.content ? message.content : "*No content*")
								.setAuthor({name: `${message.author.globalName} (@${message.author.username})`, iconURL: message.author.avatarURL()})
								.setTimestamp()
							],
							files: Array.from(message.attachments.values())
						})
						.then(() => message.react("✅"))
						.catch(error => {
							message.reply({
								allowedMentions: {repliedUser: false},
								embeds: [
									new EmbedBuilder()
									.setColor("#2b2d31")	
									.setDescription(fail+` Failed, please report the bug to @sirwaffles\`\`\`${error}\`\`\``)
								]
							});
						});
					} else {
						await result.deleteOne();

						message.reply({
							allowedMentions: {repliedUser: false},
							embeds: [
								new EmbedBuilder()
								.setColor("#2b2d31")	
								.setDescription(fail+" *Your ticket was manually deleted by an agent, which has broken your ticket. Please open a new one if you still require support.*")
							]
						});
					}
				} else {
					const deptpicker = new StringSelectMenuBuilder()
						.setCustomId("deptpicker")
						.setPlaceholder('Select a department')
					
					for (const dept of depts) {
						deptpicker.addOptions(
							new StringSelectMenuOptionBuilder()
								.setLabel(dept.name)
								.setDescription(dept.description)
								.setEmoji(dept.emoji)
								.setValue(dept.name)
						)
					}

					const response = await message.reply({
						allowedMentions: { repliedUser: false },
						components: [
							new ActionRowBuilder().addComponents(deptpicker)
						],
						embeds: [
							new EmbedBuilder()
							.setColor("#2b2d31")	
							.setDescription(info+" Please only use my DMs to open a ticket. This first message will be ignored. **Select a department to contact:**")
						]
					});

					const collectorFilter = i => {
						i.deferUpdate();
						return i.user.id === message.author.id;
					};

					response.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.StringSelect, time: 20000 })
					.then(async collected => {
						supportguild.channels.create({name: message.author.username})
						.then(c => {
							c.setParent(depts.find(i => i.name == collected.values[0]).id);
							c.setTopic("Transmit messages by prefixing them with -");

							Ticket.create({
								created: Date.now(),
								channel: c.id,
								author: message.author.id,
								department: collected.values[0]
							});

							response.edit({
								embeds: [
									new EmbedBuilder()
									.setColor("#2b2d31")
									.setDescription(success+" *Ticket creation confirmed. All messages you send now will be forwarded to a support agent.*\n\n**Please start by describing your case in as much detail as possible:**")
								],
								components: []
							});

							c.send({
								embeds: [
									new EmbedBuilder()
									.setColor("#2b2d31")	
									.setDescription(`<@${message.author.id}>\n\n*Remember to prefix messages with \`-\` to transmit them.*`)
									.setAuthor({name: `${message.author.globalName} (@${message.author.username})`, iconURL: message.author.avatarURL()})
								],
								content: "@here"
							});
						});
					})
					.catch(e => {
						response.edit({
							embeds: [
								new EmbedBuilder()
								.setColor("#2b2d31")	
								.setDescription(fail+" *Timed out*")
							],
							components: []
						})
					});
				}
			} else if (message.content[0] == "-" && message.guild.id == supportguildid && message.channel.parent && depts.some(dept => dept.id == message.channel.parent.id)) {
				const result = await Ticket.findOne({channel: message.channelId});

				if (result) {
					const noprefix = message.content.slice(1)

					client.users.cache.get(result.author).send({
						embeds: [
							new EmbedBuilder()
							.setColor("#2b2d31")	
							.setDescription(noprefix ? noprefix : "*No content*")
							.setAuthor({name: `${message.author.globalName} (@${message.author.username})`, iconURL: message.author.avatarURL()})
							.setTimestamp()
							.setFooter({text: "Support Agent"})
						],
						files: Array.from(message.attachments.values())
					});

					message.channel.send({
						embeds: [
							new EmbedBuilder()
							.setColor("#2b2d31")
							.setDescription(noprefix ? noprefix : "*No content*")
							.setAuthor({name: `${message.author.globalName} (@${message.author.username})`, iconURL: message.author.avatarURL()})
							.setTimestamp()
							.setFooter({text: "Support Agent"})
						],
						files: Array.from(message.attachments.values())
					});

					message.delete();
				} else {
					message.channel.delete();
				}
			}
		}
	},
};
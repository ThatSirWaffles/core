const express = require('express');
const server = express();
const bodyparser = require('body-parser');

server.use(bodyparser.text());
server.use(express.json());

const { externalkey, flightformchannelid, staffhubkey, eventannouncements, flightlist } = require("../config.json");
const { EmbedBuilder, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, GuildScheduledEventManager, GuildScheduledEventStatus, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { Ban } = require('./database');

var jobs = []

server.get('/bulkjobs/', async (req, res) => {
	const {token} = req.body

	jobs = [];

	if (token == externalkey) {
		res.status(200).json({jobs: jobs})
	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.post('/send/bulkusers/', async (req, res) => {
	const {token, bulk} = req.body

	if (token == externalkey) {
		try {
			if (jobs.length == 0) {
				jobs = [{task: "DM", iteration: 0, total: bulk.length}];

				res.status(200).json({message: 'Bulk job started'})
				client.channels.cache.get("994709325186600980").send(`${req.ip} started a new bulk DM job`)

				bulk.forEach((obj, i) => {
					setTimeout(() => {
						jobs = [{task: "DM", iteration: i++, total: bulk.length}];

						const embed = new EmbedBuilder()
						.setColor("#2b2d31")
						.setDescription(obj.content)
		
						if (obj.title) {
							embed.setTitle(obj.title);
						}
		
						if (obj.footer) {
							embed.setFooter({text: obj.footer});
						}
		
						client.users.send(obj.userid, {embeds: [embed]})
						.catch((e) => {
							Error(e)
						})

						if (i++ == bulk.length) {
							jobs = [];

							client.channels.cache.get("994709325186600980").send(`${req.ip}'s bulk job executed successfully`)
						}
					}, i * 500);
				});
			} else {
				res.status(500).json({message: 'Failed', error: "Bulk job already running"})
			}
		} catch (e) {
			jobs = [];

			client.channels.cache.get("994709325186600980").send(`${req.ip}'s bulk job failed\`\`\`${e}\`\`\``)
		}
	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.post('/send/user/:userid', async (req, res) => {
	const {userid} = req.params
	const {token, content, title, footer} = req.body

	if (token == externalkey) {
		try {
			const embed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(content)

			if (title) {
				embed.setTitle(title);
			}

			if (footer) {
				embed.setFooter({text: footer});
			}

			client.users.send(userid, {embeds: [embed]})
			.then(() => {
				res.status(200).json({message: 'Sent successfully'})

				client.channels.cache.get("994709325186600980").send(`\`\`\`${JSON.stringify(req.ip)}\n${JSON.stringify(req.url)}\n${JSON.stringify(req.body).replace(externalkey, "##REDACTED##")}\`\`\``)
				.catch(e => {
					console.log(e)
				});
			})
			.catch((e) => {
				Error(e)
			})
		} catch (e) {
			res.status(500).json({message: 'Failed', error: `${e}`})
		}
	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.post('/send/channel/:channelid', async (req, res) => {
	const {channelid} = req.params
	const {token, content, title, footer} = req.body

	if (token == externalkey) {
		try {
			const embed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(content)

			if (title) {
				embed.setTitle(title);
			}

			if (footer) {
				embed.setFooter({text: footer});
			}

			const sentmsg = client.channels.cache.get(channelid).send({
				embeds: [embed]
			});

			res.status(200).json({message: 'Sent successfully'})

			client.channels.cache.get("994709325186600980").send(`\`\`\`${JSON.stringify(req.ip)}\n${JSON.stringify(req.url)}\n${JSON.stringify(req.body).replace(externalkey, "##REDACTED##")}\`\`\``)
			.catch(e => {
				console.log(e)
			});
		} catch (e) {
			res.status(500).json({message: 'Failed', error: `${e}`})
		}

	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.post('/customsend/user/:userid', async (req, res) => {
	const {userid} = req.params
	const {token, message} = req.body

	if (token == externalkey) {
		try {
			client.users.send(userid, message)
			.then(() => {
				res.status(200).json({message: 'Sent successfully'})

				client.channels.cache.get("994709325186600980").send(`\`\`\`${JSON.stringify(req.ip)}\n${JSON.stringify(req.url)}\n${JSON.stringify(req.body).replace(externalkey, "##REDACTED##")}\`\`\``)
			})
			.catch((e) => {
				Error(e)
			})
		} catch (e) {
			res.status(500).json({message: 'Failed', error: `${e}`})
		}
	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.post('/customsend/channel/:channelid', async (req, res) => {
	const {channelid} = req.params
	const {token, message} = req.body

	if (token == externalkey) {
		try {
			client.channels.cache.get(channelid).send(message)
			.catch(e => {
				Error(e)
			});

			res.status(200).json({message: 'Sent successfully'})

			client.channels.cache.get("994709325186600980").send(`\`\`\`${JSON.stringify(req.ip)}\n${JSON.stringify(req.url)}\n${JSON.stringify(req.body).replace(externalkey, "##REDACTED##")}\`\`\``)
			.catch(e => {
				Error(e)
			});
		} catch (e) {
			res.status(500).json({message: 'Failed', error: `${e}`})
		}

	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.post('/createevent/:flightid', async (req, res) => {
	const {flightid} = req.params
	const {token} = req.body

	if (token == externalkey) { 
		const response = await fetch("https://staff.skyrden.com/api/v1/flights/"+flightid);
		const data = await response.json();
		const flight = data.data;

		const username = await (await fetch("https://users.roblox.com/v1/users/"+flight.host)).json();

		var classemojis = ""

		if (flight.aircraft.modelId != null) {
			if (flight.aircraft.premiumPlus != 0) {
				classemojis += " <:skrprp:1059119094789582943>"
			}
			if (flight.aircraft.premium != 0) {
				classemojis += " <:skrpr:1202940106084847647>"
			}
			if (flight.aircraft.economyPlus != 0) {
				classemojis += " <:skrecp:1059119096899313674>"
			}
			if (flight.aircraft.economy != 0) {
				classemojis += " <:skrec:1059119098405072938>"
			}
		}

		const eventmanager = new GuildScheduledEventManager(mainguild)

		eventmanager.create({
			name: flight.flightNumber,
			scheduledStartTime: new Date(flight.date*1000),
			scheduledEndTime: new Date(flight.date*1000+3600000),
			privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
			entityType: GuildScheduledEventEntityType.External,
			description: `<:skdflying:1044002420935635105> \`${flight.aircraft.name}\`${classemojis}\n<:skdtakeoff:1044002090231549992> \`${flight.airport.name}\`\n<:skdlanding:1044002105431695370> \`${flight.airport.destination}\`\n<:skdperson:1044002126910726164> \`${username.name}\``,
			entityMetadata: {location: "https://skyrden.com/"+flight.airport.name.toLowerCase()},
			image: null,
		}).then(event => {
			client.channels.cache.get(eventannouncements).messages.fetch(flightlist)
			.then(async message => {
				events = await eventmanager.fetch();

				message.edit({content: "||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| _ _ _ _ _ _"+events.filter(event => event.status === GuildScheduledEventStatus.Scheduled && event.description.includes("1044002420935635105")).map(event => event.url).join("\n"), embeds: []})
			})

			res.status(200).json({message: 'Created successfully', event: {id: event.id, url: event.url}});

			client.channels.cache.get("994709325186600980").send(`${req.ip} created a new [event](${event.url}) via the API`);
		})
		.catch(e => {
			res.status(500).json({message: 'Failed', error: `${e}`})
		});
	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.post('/updateflightform/:flightid', async (req, res) => {
	const {flightid} = req.params;
	const {token} = req.body;

	if (token == externalkey) {
		const response = await fetch("https://staff.skyrden.com/api/v1/flights/"+flightid);

		if (response.status == 200) {
			const data = await response.json();
			const selectedflight = data.data;
			
			const forms = await client.channels.cache.get(flightformchannelid).messages.fetch();
			const found = forms.filter(msg => msg.embeds[0] && msg.embeds[0].data.title.includes(selectedflight.flightNumber));

			if (found.size > 0) {
				const msg = found.values().next().value

				const host = (await (await fetch("https://staff.skyrden.com/api/v1/staff?robloxId[eq]="+selectedflight.host)).json()).data[0];
				const signups = (await (await fetch("https://staff.skyrden.com/api/v1/signups/flights?flightId="+flightid, {headers:{Authorization: staffhubkey}})).json()).data;

				const list = signups.filter(obj => obj.staff.discordId).map(obj => `<@${obj.staff.discordId}>`)
				list.unshift(`<@${host.discordId}> ***HOST***`)

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

				msg.edit({embeds: [
					new EmbedBuilder()
						.setTitle(selectedflight.flightNumber)
						.setURL("https://staff.skyrden.com/flights/"+flightid)
						.setDescription(`<:aircraft:1203078640871677982> \`${selectedflight.aircraft.name}\`${classemojis}\n\n<:gate:1203078645619621919> \`${selectedflight.airport.gate}\`\n<:origin:1203078648912150558> \`${selectedflight.airport.name}\`\n<:destination:1203078644319133767> \`${selectedflight.airport.destination}\`\n\n<:time:1203078650241744996> <t:${selectedflight.date-900}:t> <t:${selectedflight.date-900}:R>\n<:day:1203078643128082442> <t:${selectedflight.date-900}:D>`)
						.setColor("#2b2d31")
						.addFields({name: "Joined Users", value: list.join("\n")})
				]})

				res.status(200).json({message: 'Updated successfully'})
			} else {
				res.status(500).json({message: 'Failed', error: "Flight form doesn't exist"});
			}
		} else {
		res.status(500).json({message: 'Failed', error: "Invalid flight ID "+flightid});
		}
	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.post('/createflightform/:flightid', async (req, res) => {
	const {flightid} = req.params;
	const {token} = req.body;

	if (token == externalkey) {
		const response = await fetch("https://staff.skyrden.com/api/v1/flights/"+flightid);

		if (response.status == 200) {
			const data = await response.json();
			const selectedflight = data.data;

			const forms = await client.channels.cache.get(flightformchannelid).messages.fetch();

			if (forms.filter(msg => msg.embeds[0] && msg.embeds[0].data.title.includes(selectedflight.flightNumber)).size == 0) {
				const host = (await (await fetch("https://staff.skyrden.com/api/v1/staff?robloxId[eq]="+selectedflight.host)).json()).data[0];
				const signups = (await (await fetch("https://staff.skyrden.com/api/v1/signups/flights?flightId="+flightid, {headers:{Authorization: staffhubkey}})).json()).data;

				const list = signups.filter(obj => obj.staff.discordId).map(obj => `<@${obj.staff.discordId}>`)
				list.unshift(`<@${host.discordId}> ***HOST***`)

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

				const joinbutton = new ButtonBuilder()
					.setCustomId("joinflight|"+selectedflight.id)
					.setLabel("Join")
					.setStyle(ButtonStyle.Success)

				const leavebutton = new ButtonBuilder()
					.setCustomId("leaveflight|"+selectedflight.id)
					.setLabel("Leave")
					.setStyle(ButtonStyle.Danger)
				
				const refreshbutton = new ButtonBuilder()
					.setCustomId("refreshflight|"+selectedflight.id)
					.setEmoji("801832417567965205")
					.setStyle(ButtonStyle.Secondary)

				client.channels.cache.get("889184813175689226").send({
					content: "@everyone",
					embeds: [
						new EmbedBuilder()
							.setColor("#2b2d31")
							.setTitle(selectedflight.flightNumber)
							.setURL("https://staff.skyrden.com/flights/"+flightid)
							.setDescription(`<:aircraft:1203078640871677982> \`${selectedflight.aircraft.name}\`${classemojis}\n\n<:gate:1203078645619621919> \`${selectedflight.airport.gate}\`\n<:origin:1203078648912150558> \`${selectedflight.airport.name}\`\n<:destination:1203078644319133767> \`${selectedflight.airport.destination}\`\n\n<:time:1203078650241744996> <t:${selectedflight.date-900}:t> <t:${selectedflight.date-900}:R>\n<:day:1203078643128082442> <t:${selectedflight.date-900}:D>`)
							.addFields({name: "Joined Users", value: list.join("\n")})
					],
					components: [
						new ActionRowBuilder().addComponents(joinbutton, leavebutton, refreshbutton)
					]
				})
				.then(() => {
					res.status(200).json({message: 'Sent successfully'});

					client.channels.cache.get("994709325186600980").send(`\`\`\`${JSON.stringify(req.ip)}\n${JSON.stringify(req.url)}\n${JSON.stringify(req.body).replace(externalkey, "##REDACTED##")}\`\`\``)
				})
				.catch(e => {
					res.status(500).json({message: 'Failed', error: `${e}`});
				})
			} else {
				res.status(500).json({message: 'Failed', error: "Flight form already exists"});
			}
		} else {
			res.status(500).json({message: 'Failed', error: "Invalid flight ID "+flightid});
		}
	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.get('/groupbans/', async (req, res) => {
	Ban.find({}, { date: 1, victim: 1, reason: 1 })
	.exec()
	.then(bans => {
		res.status(200).json({ data: bans });
	})
	.catch(err => {
		res.status(500).json({ error: err.message });
	});
})

server.all('/', async (req, res) => {
	res.send("Skyrden Core")
})

server.listen(8010, () => {
	console.log('[Skyrden Core] - Server is ready.')
})
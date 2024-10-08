const express = require('express');
const server = express();
const bodyparser = require('body-parser');
const noblox = require('noblox.js')

const { flightformchannelid, staffhubkey, eventannouncements, flightlist, success, coretokens, thumbnails, cookie } = require("../config.json");
const { EmbedBuilder, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, GuildScheduledEventManager, GuildScheduledEventStatus, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { Ban, User, System } = require('./database');
const { updateRoles } = require('../commands/public/verify');

noblox.setCookie(cookie).then(()=> {
	console.log('NOBLOX >>		READY');
}).catch((error) => {
	console.log('NOBLOX >>		ERROR', error);
})

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function clean(str) {
    for (const [name, value] of Object.entries(coretokens)) {
        const escapedValue = escapeRegExp(String(value));
        const regex = new RegExp(escapedValue, 'g');
        str = str.replace(regex, name);
		str = str.replace("```", "<CODEBLOCK>");
    }
    return str;
}

server.use(bodyparser.text());
server.use(express.json());

server.use((req, res, next) => {
	if (req.method == "POST") {
		client.channels.cache.get("994709325186600980").send(`\`${req.ip}\` to \`${req.url}\`\n\`\`\`${clean(JSON.stringify(req.body))}\`\`\``);
	}

    next();
});

var jobs = []

server.get('/bulkjobs/', async (req, res) => {
	const {token} = req.body

	jobs = [];

	if (Object.values(coretokens).includes(token)) {
		res.status(200).json({jobs: jobs})
	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.post('/send/bulkusers/', async (req, res) => {
	const {token, bulk} = req.body

	if (Object.values(coretokens).includes(token)) {
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
							throw new Error(e)
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

	if (Object.values(coretokens).includes(token)) {
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
				.catch(e => {
					console.log(e)
				});
			})
			.catch((e) => {
				throw new Error(e)
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

	if (Object.values(coretokens).includes(token)) {
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

	if (Object.values(coretokens).includes(token)) {
		try {
			client.users.send(userid, message)
			.then(() => {
				res.status(200).json({message: 'Sent successfully'})
			})
			.catch((e) => {
				throw new Error(e)
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

	if (Object.values(coretokens).includes(token)) {
		try {
			client.channels.cache.get(channelid).send(message)
			.catch(e => {
				throw new Error(e)
			});

			res.status(200).json({message: 'Sent successfully'})
			.catch(e => {
				throw new Error(e)
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

	if (Object.values(coretokens).includes(token)) {
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

	if (Object.values(coretokens).includes(token)) {
		const response = await fetch("https://staff.skyrden.com/api/v1/flights/"+flightid);

		if (response.status == 200) {
			const data = await response.json();
			const selectedflight = data.data;
			
			const forms = await client.channels.cache.get(flightformchannelid).messages.fetch();
			const found = forms.filter(msg => msg.embeds[0] && msg.embeds[0].data.url.split('/').pop() == flightid);

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

	if (Object.values(coretokens).includes(token)) {
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

server.get('/checkcode/:userid/:code', async (req, res) => {
	const {userid, code} = req.params

	if (verifCodes.some(obj => obj.code == code)) {
		const obj = verifCodes.find(obj => obj.code == code)
		res.status(202).json({message: 'Code valid, linked Discord', username: obj.username})

		var result = await User.findOne({'roblox.id': userid});

		if (!result) {
			const username = await (await fetch("https://users.roblox.com/v1/users/"+userid)).json();
			const sys = await System.findOne();

			result = User.create({
				roblox: {
					id: userid,
					name: username.name,
					nick: username.displayName
				},
				userId: sys.userCounter,
				skyrmont: 0,
				flights: [],
				discord: {
					id: obj.userid,
					name: obj.username,
					streak: 0,
					lastStreak: 0
				}
			});

			sys.userCounter += 1;
			await sys.save();
		} else {
			result.discord = {
				id: obj.userid,
				name: obj.username,
				streak: 0,
				lastStreak: 0
			};
			await result.save();
		}

		var result = await User.findOne({'roblox.id': userid});

		client.users.send(obj.userid, {
			embeds: [
				new EmbedBuilder()
				.setDescription(success+` Your account has been linked with **${result.roblox.name}** on Roblox`)
			]
		})
		.catch(e => {
			console.log(e)
		})
		
		updateRoles(result, mainguild.members.cache.get(obj.userid))

		clearTimeout(obj.ref);
		verifCodes = verifCodes.filter(obj => obj.code !== code);
	} else {
		res.status(500).json({message: 'Invalid code'})
	}
})

server.post('/users/init/:userid', async (req, res) => {
	const {userid} = req.params;
	const {token} = req.body

	if (Object.values(coretokens).includes(token)) {
		try {
			const result = await User.findOne({'roblox.id': userid});

			if (result) {
				throw new Error("Already exists")
			} else {
				const username = await (await fetch("https://users.roblox.com/v1/users/"+userid)).json();
				const sys = await System.findOne();

				User.create({
					roblox: {
						id: userid,
						name: username.name,
						nick: username.displayName
					},
					userId: sys.userCounter,
					skyrmont: 0,
					flights: [],
				});

				sys.userCounter += 1;
				await sys.save();

				res.status(201).json({message: 'Created successfully'})
			}
		} catch (e) {
			console.log(e)
			res.status(500).json({message: 'Failed', error: `${e}`})
		}
	} else {
		res.status(401).json({message: 'Invalid token'})
	}
})

server.get('/users/search/:param/:value', async (req, res) => {
	const {param, value} = req.params

	const result = await User.findOne({[param]: value});

	if (result) {
		res.status(200).json(result);
	} else {
		res.status(404).json({message: 'No user found'});
	}
})

server.post('/rank/:target/:rank', async (req, res) => {
	const {target, rank} = req.params;
	const {token} = req.body;

	if (Object.values(coretokens).includes(token)) {
		console.log(`Attempting to rank ${target} to ${rank}`);

		noblox.setRank(12253448, target, parseInt(rank))
		.then(result => {
			res.status(200).json({message: 'Ranked successfully', details: result});
			console.log("Ranked")
		})
		.catch(e => {
			res.status(500).json({message: 'Ranking failed', error: `${e}`});
			console.log(e);
		})
	} else {
		res.status(401).json({message: 'Invalid token'});
		console.log(`${req.ip} attempted to rank ${target} with an invalid token`);
	}
})

server.post('/kick/:target', async (req, res) => {
	const target = req.params.target
	const rank = req.params.rank
	const token = req.body.token

	if (Object.values(coretokens).includes(token)) {
		console.log(`Attempting to kick ${target}`)

		noblox.exile(12253448, target)
		.then(result => {
			res.status(200).json({message: 'Kicked successfully', details: result})
			console.log("Kicked")
		})
		.catch(e => {
			res.status(500).json({message: 'Kick failed', error: `${e}`})
			console.log(e)
		})
	} else {
		res.status(401).json({message: 'Invalid token'})
		console.log(`${req.ip} failed miserably`)
	}
})

server.post('/shout', async (req, res) => {
	const {token, content} = req.body

	if (Object.values(coretokens).includes(token)) {
		console.log("Attempting to shout "+ content)

		try {
			const result = await noblox.shout(12253448, content)
			res.status(200).json({message: 'Sent successfully', details: result})
			console.log("Shouted")
		} catch (e) {
			res.status(500).json({message: 'Shout failed', error: `${e}`})
			console.log(e)
		}

	} else {
		res.status(401).json({message: 'Invalid token'})
		console.log(`${req.ip} failed miserably`)
	}
})

server.post('/signal/:type', async (req, res) => {
	const {type} = req.params;
	const {token, flight, players} = req.body;
	if (Object.values(coretokens).includes(token)) {
		console.log("received "+type);

		if (type == "open") {
			const anns = await client.channels.cache.get(eventannouncements).messages.fetch();
			const found = anns.filter(msg => msg.embeds[0] && msg.embeds[0].data.title == flight.flightNumber);

			if (found.size == 0) {
				if (anns.filter(msg => msg.embeds[0] && msg.embeds[0].data.title.includes(flight.flightNumber)).size == 0) {
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
	
					const joinFlight = new ButtonBuilder()
						.setURL("https://skyrden.com/"+flight.airport.name.toLowerCase())
						.setLabel("Join Flight")
						.setStyle(ButtonStyle.Link)
					
					var embed = new EmbedBuilder()
					.setColor("#2b2d31")
					.setTitle(flight.flightNumber)
					.setURL("https://skyrden.com/"+flight.airport.name.toLowerCase())
					.setDescription(`This flight is now **open** in **[${flight.airport.name}](<https://skyrden.com/${flight.airport.name.toLowerCase()}>)** for all passengers to **${flight.airport.destination}**\n\n- Upon joining, use the **self check-in**, then the **baggage drop**\n- If you need help, ask a member of staff`)
					.addFields({name: "Flight Info", value: `<:aircraft:1203078640871677982> \`${flight.aircraft.name}\`${classemojis}\n\n<:gate:1203078645619621919> \`${flight.airport.gate}\`\n<:origin:1203078648912150558> \`${flight.airport.name}\`\n<:destination:1203078644319133767> \`${flight.airport.destination}\``})
					.setTimestamp(new Date(Date.now() + 600000))
					.setFooter({text: "Locking in 10 minutes"})
					
					if (thumbnails[flight.airport.name.toLowerCase()]) {
						embed.setImage(thumbnails[flight.airport.name.toLowerCase()]);
					}

					client.channels.cache.get(eventannouncements).send({
						content: "@everyone",
						embeds: [embed],
						components: [
							new ActionRowBuilder().addComponents(joinFlight)
						]
					})
					.then(() => {
						res.status(200).json({message: 'Sent successfully'});
					})
					.catch(e => {
						res.status(500).json({message: 'Failed', error: `${e}`});
					})
				} else {
					res.status(500).json({message: 'Failed', error: "Flight already announced"});
				}
			}
		} else if (type == "lock") {
			const anns = await client.channels.cache.get(eventannouncements).messages.fetch();
			const found = anns.filter(msg => msg.embeds[0] && msg.embeds[0].data.title == flight.flightNumber);

			if (found.size > 0) {
				const msg = found.values().next().value
				const joinFlight = new ButtonBuilder()
					.setURL("https://skyrden.com/"+flight.airport.name.toLowerCase())
					.setLabel("Join Flight")
					.setStyle(ButtonStyle.Link)
					.setDisabled(true)
				
				var embed = new EmbedBuilder()
				.setColor("#2b2d31")
				.setTitle(flight.flightNumber)
				.setDescription(`This flight is now **locked**, and passengers may no longer join`)
				.addFields(msg.embeds[0].data.fields)
				.setTimestamp(new Date(Date.now()))
				.setFooter({text: "Locked"})
				
				if (thumbnails[flight.airport.name.toLowerCase()]) {
					embed.setImage(thumbnails[flight.airport.name.toLowerCase()]);
				}

				msg.edit({
					content: "@everyone",
					embeds: [embed],
					components: [
						new ActionRowBuilder().addComponents(joinFlight)
					]
				})
				.then(() => {
					res.status(200).json({message: 'Sent successfully'});
				})
				.catch(e => {
					res.status(500).json({message: 'Failed', error: `${e}`});
				})
			} else {
				res.status(500).json({message: 'Failed', error: "Flight was never opened"});
			}
		} else if (type == "end") {
			const anns = await client.channels.cache.get(eventannouncements).messages.fetch();
			const found = anns.filter(msg => msg.embeds[0] && msg.embeds[0].data.title == flight.flightNumber);

			if (found.size > 0) {
				const msg = found.values().next().value
				msg.delete();

				for (i of players) {
					var result = await User.findOne({'roblox.id': i});

					if (result) {
						result.skyrmont += 5;
						result.flights.push({id: flight.id, name: flight.flightNumber});

						result.save();

						if (result.discord && result.discord.id) {
							setTimeout(() => {
								client.users.send(result.discord.id, {
									embeds: [
										new EmbedBuilder()
											.setColor("#2b2d31")
											.setDescription(`:tada: Thank you for joining **${flight.flightNumber}**! You've been given \`5 sm.\`, and the flight has been logged to your profile. Use \`/profile\` in <#891384296319909908> to check your stats.`)
									]
								});
							}, 500);
						}
					}
				}
			}
		} else {
			res.status(404).json({message: 'Unknown signal type'});
		}
	} else {
		res.status(401).json({message: 'Invalid token'});
		console.log(`${req.ip} failed miserably`);
	}
})

server.all('/', async (req, res) => {
	res.send("Skyrden Core")
})

server.listen(8010, () => {
	console.log('WEBSERVER >>		READY');
})
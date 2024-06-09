const { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const {botkey, wfachannelid} = require("../config.json");
const { Ban } = require("./database");

async function checkForWFA() {
	const res = await (await fetch("https://groups.roblox.com/v1/groups/12253448/roles/71519783/users?limit=100")).json();

	if (res.data.length > 0) {
		res.data.forEach(async obj => {
			const user = await (await fetch(`https://users.roblox.com/v1/users/${obj.userId}`)).json();
			const dif = Date.now() - new Date(user.created).getTime()
			const result = await Ban.findOne({victim: obj.userId});

			if (result) {
				fetch(`http://localhost:8010/kick/${obj.userId}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: botkey})})
				.then(res => {
					if (!res.ok) {
						throw new Error(res.statusText)
					}
				})
				.then(() => {
					client.channels.cache.get("994709325186600980").send(`Kicked banned user [${obj.username}](<https://www.roblox.com/users/${obj.userId}/profile>)`);
				})
				.catch(err => {
					client.channels.cache.get("994709325186600980").send(`**⚠ Failed to kick banned user [${obj.username}](<https://www.roblox.com/users/${obj.userId}/profile>)**\n\n\`\`\`${err}\`\`\``);
				});
			} else if (dif >= 31556926000) {
				fetch(`http://localhost:8010/rank/${obj.userId}/5`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: botkey})})
				.then(() =>{
					client.channels.cache.get("994709325186600980").send(`Auto-ranked [${obj.username}](<https://www.roblox.com/users/${obj.userId}/profile>) to EC (${Math.round(dif / (1000 * 3600 * 24))} days old)`)
				})
			} else {
				const msgs = await client.channels.cache.get(wfachannelid).messages.fetch();

				if (msgs.filter(msg => msg.embeds[0] && msg.embeds[0].data.url.includes(obj.userId)).size == 0) {
					const confirmbutton = new ButtonBuilder()
						.setCustomId(`confirmAutoRank|${obj.userId}|${obj.username}|${dif}`)
						.setLabel("Rank")
						.setStyle(ButtonStyle.Success)

					const kickbutton = new ButtonBuilder()
						.setCustomId(`kickAutoRank|${obj.userId}|${obj.username}|${dif}`)
						.setLabel("Kick")
						.setStyle(ButtonStyle.Secondary)

					const banbutton = new ButtonBuilder()
						.setCustomId(`banAutoRank|${obj.userId}|${obj.username}|${dif}`)
						.setLabel("Ban")
						.setStyle(ButtonStyle.Danger)

					client.channels.cache.get(wfachannelid).send({
						embeds: [
							new EmbedBuilder()
								.setColor("#2b2d31")	
								.setTitle(`${user.displayName} (@${user.name})`)
								.setDescription(`${Math.round(dif / (1000 * 3600 * 24))} days old`)
								.setURL(`https://www.roblox.com/users/${obj.userId}/profile`)
						],
						components: [new ActionRowBuilder().addComponents(confirmbutton, kickbutton, banbutton)]
					});
				}
			}
		});
	}
}

setInterval(checkForWFA, 60000)
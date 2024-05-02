const { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const {botkey, wfachannelid} = require("../config.json");

async function checkForWFA() {
	const res = await (await fetch("https://groups.roblox.com/v1/groups/12253448/roles/71519783/users?limit=100")).json();

	if (res.data.length > 0) {
		res.data.forEach(async obj => {
			const user = await (await fetch(`https://users.roblox.com/v1/users/${obj.userId}`)).json();
			const dif = Date.now() - new Date(user.created).getTime()

			if (dif >= 31556926000) {
				fetch(`http://localhost:8000/rank/${obj.userId}/5`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: botkey})})
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
						.setStyle(ButtonStyle.Danger)

					client.channels.cache.get(wfachannelid).send({
						embeds: [
							new EmbedBuilder()
								.setColor("#2b2d31")	
								.setTitle(`${user.displayName} (@${user.name})`)
								.setDescription(`${Math.round(dif / (1000 * 3600 * 24))} days old`)
								.setURL(`https://www.roblox.com/users/${obj.userId}/profile`)
						],
						components: [new ActionRowBuilder().addComponents(confirmbutton, kickbutton)]
					});
				}
			}
		});
	}
}

setInterval(checkForWFA, 60000)
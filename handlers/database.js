const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/core');

const Ticket = mongoose.model("Ticket", new Schema({
		created: Number,
		channel: String,
		author: String,
		department: String
	}, { collection: 'tickets' })
);

const Ban = mongoose.model("Ban", new Schema({
		date: Number,
		author: String,
		victim: String,
		reason: String
	}, { collection: 'groupBans' })
);

const User = mongoose.model("User", new Schema({
	userId: Number,
	skyrbux: Number,
	flightsAttended: Number,
	roblox: {
		id: String,
		name: String,
		nick: String,
	},
	discord: {
		id: String,
		name: String,
		streak: Number,
	}
}, { collection: 'users' })
);

const System = mongoose.model("System", new Schema({
	userCounter: Number
}, { collection: 'system' })
);

module.exports = {
	Ticket,
	Ban,
	User,
	System
};
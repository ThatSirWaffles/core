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

module.exports = {
	Ticket,
	Ban
};
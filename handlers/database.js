const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/core');

const Ticket = mongoose.model("Ticket", new Schema(
	{
		created: Number,
		channel: String,
		author: String,
		department: String
	}
));

module.exports = {
	Ticket
};
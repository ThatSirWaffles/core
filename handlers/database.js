const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/');

// export const ticket = mongoose.model(new Schema({
// 	channel: String,
// 	author: String,
// 	agent: String,
// 	department: String
// }));
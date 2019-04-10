var mongoose = require('./db.js'),
	Schema = mongoose.Schema;

var HistoriesSchema = new Schema({
	title: String,
	start: String,
	end: String,
	color: String
});

module.exports = mongoose.model('Histories', HistoriesSchema);

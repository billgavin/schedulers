var mongoose = require('./db.js'),
	Schema = mongoose.Schema;

var DaySchema = new Schema({
	year: Number,
	holidays: [],
	weekendsoff: []
});

module.exports = mongoose.model('Day', DaySchema);

var mongoose = require('./db.js'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	phone: String,
	email: String,
	shift: {
		ampm: {type: Number, default: 0},
		normal: {type: Number, default: 0},
		weekend: {type: Number, default: 0}
	}
});

module.exports = mongoose.model('User', UserSchema);

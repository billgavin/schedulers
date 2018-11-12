var mongoose = require('./db.js'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	phone: String,
	email: String
});

module.exports = mongoose.model('User', UserSchema);

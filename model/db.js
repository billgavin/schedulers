var mongoose = require('mongoose');
var db_url = 'mongodb://localhost:27017/schedulers';

mongoose.connect(db_url, {useNewUrlParser:true})

mongoose.connection.on('connected', function() {
	console.log('Mongoose connection open to ' + db_url);
});

mongoose.connection.on('error', function(err) {
	console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function() {
	console.log('Mongoose connection disconnected.');
});

module.exports = mongoose;

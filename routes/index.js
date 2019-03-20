var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
var md5 = require('js-md5');
var User = require('../model/user');
var Days = require('../model/days');
var Histories = require('../model/historys');
var mongoose = require('mongoose');
var Scheduler = require('../scheduler');


var timezone = 'Asia/Shanghai';
var now = moment()

/* GET home page. */
router.get('/', function(req, res, next) {
	date = new Date();
	now_str = moment(date).format('YYYY-MM-DD');
	year = date.getFullYear();
	console.log('Now: ' + now_str);
	User.find(function(err, users) {
		if (err) res.render('index', { title: '运维值班表', schedulers: JSON.stringify([])});
		ampm = {};
		normal = {};
		weekend = {};
		users.forEach(function(value) {
			shifts = value.shift;
			ampm_shift = shifts.ampm;
			delete value.shift;
			if (ampm_shift){
				ampm[ampm_shift] = value;
			}
			normal_shift = shifts.normal;
			if (normal_shift) {
				normal[normal_shift] = value;
			}
			weekend_shift = shifts.weekend;
			if (weekend_shift) {
				weekend[weekend_shift] = value;
			}
		});
		Days.findOne({'year': year}, function(err, days) {
			if (err) res.render('index', { title: '运维值班表', schedulers: JSON.stringify([])});
			holidays = days.holidays;
			weekendsoff = days.weekendsoff;
			Histories.find(function(err, docs) {
				if(err) console.log(err);
				last = Scheduler.get_schedulers(year, ampm, normal, weekend, holidays, weekendsoff);
				schedulers = docs.concat(last);
				res.render('index', { title: '运维值班表', schedulers: JSON.stringify(schedulers)});
			});
		});
	});
});


module.exports = router;

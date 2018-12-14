var express = require('express');
var router = express.Router();
var moment = require('moment');
var User = require('../model/user');
var mongoose = require('mongoose');

var timezone = 'Asia/Shanghai';
var now = moment()
console.log(now.format())

function scheduler(day, shift, user) {
	shifts = [
		{
			title: '早班：',
			start: moment(day + ' 07:00').format('YYYY-MM-DD HH:mm'),
			end: moment(day + ' 09:00').format('YYYY-MM-DD HH:mm'),
			allday:false,
			color: 'orange'
		},
		{
			title: '日常班：',
			start: moment(day + ' 09:00').format('YYYY-MM-DD HH:mm'),
			end: moment(day + ' 18:00').format('YYYY-MM-DD HH:mm'),
			allday:false,
			color: 'blue'
		},
		{
			title: '晚班：',
			start: moment(day + ' 18:00').format('YYYY-MM-DD HH:mm'),
			end: moment(day + ' 23:00').format('YYYY-MM-DD HH:mm'),
			allday:false,
			color: 'orange'
		},
		{
			title: '周末班：',
			start: moment(day + ' 07:00').format('YYYY-MM-DD HH:mm'),
			end: moment(day + ' 23:00').format('YYYY-MM-DD HH:mm'),
			allday:false,
			color: 'red'
		}
	]

	s = {
		title: shifts[shift].title + user.name + ' ' + user.phone,
		start: shifts[shift].start,
		end: shifts[shift].end,
		color: shifts[shift].color
	};
	return s

}

function contains(arr, obj) {
	var i = arr.length;
	while (i--) {
		if (arr[i] === obj) {
			return true;
		}
	}
	return false;
}

function getYearWeek(y, m, d) {
	var d1 = new Date(y, m-1, d);
	var d2 = new Date(y, 0, 1);
	d = Math.round((d1 - d2) / 86400000);
	return Math.ceil((d + ((d2.getDay() + 1) -1)) / 7);
}

/* GET home page. */
router.get('/', function(req, res, next) {
	date = new Date();
	month = date.getMonth();
	year = date.getFullYear();
	month_day = new Date(year, month, 0).getDate();
	User.find(function(err, users) {
		if (err) {
			console.error(err);
		}else {
			console.log(users);
			schedulers = [];
			for (var i=1; i<=month_day; i++) {
				day = new Date(year, month, i).getDay();
				date_str = year + '-' + (month + 1) + '-' + i;
				week = getYearWeek(year, month+1, i);
				console.log(week);
				weekdays = new Array(1, 2, 3, 4, 5);
				weekends = new Array(0, 6);
				if (contains(weekdays, day)) {
					schedulers.push(scheduler(date_str, 0, users[0]));
					schedulers.push(scheduler(date_str, 1, users[day]));
					schedulers.push(scheduler(date_str, 2, users[2]));
				}
				if (contains(weekends, day)) {
					schedulers.push(scheduler(date_str, 3, users[1]));
				}

			}
  			res.render('index', { title: '运维值班表', schedulers: JSON.stringify(schedulers)});
		}
	});
});


module.exports = router;

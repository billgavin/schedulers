var moment = require('moment-timezone');
var md5 = require('js-md5');
var User = require('./model/user');
var Days = require('./model/days');
var utils = require('./utils');

var timezone = 'Asia/Shanghai';
var now = moment()
var new_year_day = now.year + '-01-01';
//生成排班序列
function scheduler(day, shift, user) {
	shifts = [
		{
			title: '早班：',
			start: moment.tz(day + ' 07:00', timezone).format(),
			end: moment.tz(day + ' 09:00', timezone).format(),
			allday:false,
			color: 'orange'
		},
		{
			title: '日常班：',
			start: moment.tz(day + ' 09:00', timezone).format(),
			end: moment.tz(day + ' 18:00', timezone).format(),
			allday:false,
		},
		{
			title: '晚班：',
			start: moment.tz(day + ' 18:00', timezone).format(),
			end: moment.tz(day + ' 23:00', timezone).format(),
			allday:false,
			color: 'orange'
		},
		{
			title: '周末班：',
			start: moment.tz(day + ' 07:00', timezone).format(),
			end: moment.tz(day + ' 23:00', timezone).format(),
			allday:false,
			color: 'red'
		}
	]

	s = {
		//title: shifts[shift].title + user.name + ' ' + user.phone,
		title: shifts[shift].title + user.name,
		start: shifts[shift].start,
		end: shifts[shift].end,
		color: shifts[shift].color
	};
	return s

}


function get_schedulers(year, ampm, normal, weekend, holidays, weekendsoff, start=new_year_day) {
	ak = Object.keys(ampm);
	nk = Object.keys(normal);
	wk = Object.keys(weekend);
	weekdays = new Array(1, 2, 3, 4, 5);
	schedulers = [];
	workdays = weekendsoff.slice(0);
	for (var month=0; month<12; month++) {
		month_day = new Date(year, month + 1, 0).getDate();
		for (var d=1; d<=month_day; d++) {
			//获取日期
			date = new Date(year, month, d);
			date_str = moment(date).format('YYYY-MM-DD');
			//周一到周五
			weekday = date.getDay();
			if (utils.contains(weekdays, weekday) && ! utils.contains(holidays, date_str)) {
				workdays.push(date_str);
			}else if((weekday == 0 || weekday == 6) && ! utils.contains(weekendsoff, date_str)){	
				holidays.push(date_str);
			}
		}
	}
	workdays.sort(function(a, b) {
		return Date.parse(a) - Date.parse(b);
	});
	wdays = [];
	for(var i=0; i<workdays.length; i++) {
		if(utils.campDate(start, workdays[i])) continue;
		wdays.push(workdays[i]);
	}
	week = 0;
	for (var i=0; i<wdays.length; i++) {
		dstr = wdays[i];
		weekday = new Date(dstr).getDay();
		if (weekday == 1) week += 1;
		if (utils.contains(weekdays, weekday)) {
			schedulers.push(scheduler(dstr, 1, normal[weekday.toString()]));
		}
		if (utils.contains(weekendsoff, dstr)) {
			woff = weekendsoff.indexOf(dstr) % nk.length + 1;
			wshift = scheduler(dstr, 1, normal[woff.toString()]);
			schedulers.push(wshift);
		}
		a = (week % ak.length + 1).toString();
		schedulers.push(scheduler(dstr, 0, ampm[a]));
		schedulers.push(scheduler(dstr, 2, ampm[a]));
	}
	holidays.sort(function(a, b) {
		return Date.parse(a) - Date.parse(b);
	});
	hdays = [];
	for (var i=0; i<holidays.length; i++) {
		if(utils.campDate(start, holidays[i])) continue;
		hdays.push(holidays[i]);
	}
	for (var i=0; i<hdays.length; i++) {
		dstr = hdays[i];
		w = (i % wk.length + 1).toString();
		sholiday = scheduler(dstr, 3, weekend[w]);
		schedulers.push(sholiday);
	}
	schedulers.sort(function(a, b) {
		return Date.parse(a.start) - Date.parse(b.start);
	});
	return schedulers;
}


module.exports = {
get_schedulers: get_schedulers,
};

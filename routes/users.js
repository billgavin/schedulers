var express = require('express');
var router = express.Router();
var User = require('../model/user');
var Days = require('../model/days');
var Histories = require('../model/historys');
var mongoose = require('mongoose');
var utils = require('../utils');
var redis = require('redis');
var rcache = redis.createClient();
var Scheduler = require('../scheduler');
var moment = require('moment-timezone');

var timezone = 'Asia/Shanghai';
var now = moment();
var year = new Date().getFullYear();

/* GET users listing. */
router.get('/', function(req, res, next) {
	User.find(function(err, users) {
		if (err) {
			console.error(err);
		}else {
			as = {};
			ns = {};
			ws = {};
			users.forEach(function(value) {
				ss = value.shift;
				if(ss.ampm) as[ss.ampm] = value.name;
				if(ss.normal) ns[ss.normal] = value.name;
				if(ss.weekend) ws[ss.weekend] = value.name;
			});
			a_count = Object.keys(as).length + 1;
			a_str = [];
			for(var i=1; i<a_count; i++) {
				a_str.push(as[i.toString()]);
			}
			n_count = Object.keys(ns).length + 1;
			n_str = [];
			for(var i=1; i<n_count; i++) {
				n_str.push(ns[i.toString()]);
			}
			w_count = Object.keys(ws).length + 1;
			w_str = [];
			for(var i=1; i<w_count; i++) {
				w_str.push(ws[i.toString()]);
			}
			Days.findOne({'year': year}, function(err, days) {
                       		holidays = days.holidays;
                       		weekendsoff = days.weekendsoff;
				res.render('users', {title: '后台管理', users: users, ss: {a: a_count, n: n_count, w: w_count}, shifts: {ampm: a_str.join(), normal: n_str.join(), weekend: w_str.join()}, holidays: holidays.join(), weekendsoff: weekendsoff.join()});
			});
		}
	});
});

router.post('/login', function(req, res, next) {
	username = req.body.name;
	password = req.body.password;
	if ((username == 'admin') && (password == 'soufun.com')) {
		User.find(function(err, users) {
			if (err) {
				console.error(err);
			}else {
				as = {};
				ns = {};
				ws = {};
				users.forEach(function(value) {
					ss = value.shift;
					if(ss.ampm) as[ss.ampm] = value.name;
					if(ss.normal) ns[ss.normal] = value.name;
					if(ss.weekend) ws[ss.weekend] = value.name;
				});
				a_count = Object.keys(as).length + 1;
				a_str = [];
				for(var i=1; i<a_count; i++) {
					a_str.push(as[i.toString()]);
				}	
				n_count = Object.keys(ns).length + 1;
				n_str = [];
				for(var i=1; i<n_count; i++) {
					n_str.push(ns[i.toString()]);
				}
				w_count = Object.keys(ws).length + 1;
				w_str = [];
				for(var i=1; i<w_count; i++) {
					w_str.push(ws[i.toString()]);
				}
				Days.findOne({'year': year}, function(err, days) {
                        		holidays = days.holidays;
                        		weekendsoff = days.weekendsoff;
					res.render('users', {title: '后台管理', users: users, ss: {a: a_count, n: n_count, w: w_count}, shifts: {ampm: a_str.join(), normal: n_str.join(), weekend: w_str.join()}, holidays: holidays.join(), weekendsoff: weekendsoff.join()});
				});
			}
		});
	}else {
		req.flash('error', '用户名或密码错误！');
		res.redirect('./index');
	}

});

router.post('/add', function(req, res, next) {
	data = req.body;
	data._id = new mongoose.Types.ObjectId();
	user = new User(data);
	user.save(function(err) {
		if (err) {
			req.flash('error', '添加失败！');
			res.redirect('./');
		}else {
			rcache.del(year + '*', function(err) {
				if (err) console.log(err);
			});
			req.flash('success', '添加成功.');
			res.redirect('./');
		}
	});
});

router.get('/delete', function(req, res, next) {
	data = req.query.id;
	now_str = now.format('YYYY-MM-DD');
	User.findByIdAndRemove(data, function(err, doc) {
		if(!err){
			User.find(function(err, users) {
				ampm = doc.shift.ampm;
				normal = doc.shift.normal;
				weekend = doc.shift.weekend;
				as = 0;
				ns = 0;
				ws = 0;
				users.forEach(function(value) {
					s = value.shift
					if(s.ampm) as += 1;
					if(s.normal) ns += 1;
					if(s.weekend) ws += 1;
				});
				if(ampm) as += 1;
				if(normal) ns += 1;
				if(weekend) ws += 1;
				users.forEach(function(value) {
					s = value.shift
					if (ampm) {
						a = ampm;
						if(value.shift.ampm < ampm) {
							a = ampm - as;
						}
						s['ampm'] -= a;
						User.updateOne({name: value.name}, {shift: s}, function(err, docs) {
							if (!err) {
								console.log(docs);
							}
						});
					}
					if (normal) {
						a = normal
						if (value.shift.normal < normal) {
							a = normal - ns;
						}
						s['normal'] -= a;
						User.updateOne({name: value.name}, {shift: s}, function(err, docs) {
							if (!err) {
								console.log(docs);
							}
						});
					}
					if (weekend) {
						a = weekend;
						if (value.shift.weekend < weekend) {
							a = weekend - ws;
						}
						s['weekend'] -= a;
						console.log(s);
						User.updateOne({name: value.name}, {shift: s}, function(err, docs) {
							if (!err) {
								console.log(docs);
							}
						});
					}
				});
			});
			Histories.find(function(err, docs) {
				start_date = year + '-01-01';
				if (!err && docs.length != 0) {
					history_end = docs[docs.length-1];
					history_date = moment(Date.parse(history_end.start));
					start_date = history_date.add(1, 'days').format('YYYY-MM-DD');
				}
				rcache.get(start_date, function(err, value) {
					schedulers = '';
					if(err || ! value) {
						last = Scheduler.get_schedulers(year, ampm, normal, weekend, holidays, weekendsoff, start_date);
						rcache.set(start_date, JSON.stringify(last), function(err) {
							if (err) console.log(err);
						});
						schedulers = docs.concat(last);
					}else {
						last = eval('(' + value + ')');
						schedulers = docs.concat(last);
					}
					historys = [];
					schedulers.forEach(function(scheduler) {
						if (utils.campDate('2019-03-23', moment(Date.parse(scheduler.start)).format('YYYY-MM-DD'))) {
							historys.push(scheduler);
						}
					});
					Histories.insertMany(historys, function(err) {
						if (err) console.log(err);
					});
				});
				rcache.flushall(function(err) {
					if(err) console.log(err);
				});
			});

			res.redirect('./');
		}
	});
});

router.post('/days', function(req, res, next) {
	data = req.body;
	holidays = utils.trim(data.holidays);
	weekendoff = utils.trim(data.weekendoff);
	date = new Date();
	year = date.getFullYear();
	try{
		Days.bulkWrite([
			{deleteOne: {"filter": {"year": year}}},
			{insertOne: {"document": {
				"year": year,
				"holidays": holidays.split(','),
				'weekendsoff': weekendoff.split(',')
			}}}
		]);
		rcache.del(year + '*', function(err) {
			if (err) console.log(err);
		});
		req.flash('success', '添加成功.');
		res.redirect('./');
	} catch (e) {
		req.flash('error', '添加失败!');
		res.redirect('./');
	}
});

router.post('/update', function(req, res, next) {
	data = req.body;
	ampm = utils.trim(data.ampm).split(',');
	normal = utils.trim(data.normal).split(',');
	weekend = utils.trim(data.weekend).split(',');
	var flag = true;
	for (var i=0; i<weekend.length; i++) {
		u = weekend[i];
		a = utils.contains(ampm, u) ? ampm.indexOf(u) + 1 : 0;
		n = utils.contains(normal, u) ? normal.indexOf(u) + 1 : 0;
		s = {'ampm': a, 'normal': n, 'weekend': i+1};
		User.updateOne({name: u}, {shift: s}, function(err, docs) {
			if (err) {
				flag &= false;
				console.log(err);
			}else {
				console.log(docs);
			}
		});
	}
	if (flag) {
		rcache.del(year + '*', function(err) {
			if (err) console.log(err);
		});
		req.flash('success', '添加成功。');
		res.redirect('./');	
	}else {
		req.flash('error', '添加失败!');
		res.redirect('./');
	}
});


router.get('/del_history', function(req, res, next) {
	Histories.remove({start: /2019/}, function(err) {
		if(!err) {
			console.log('删除成功')
			res.redirect('./');
		}
	});
});


module.exports = router;

var express = require('express');
var router = express.Router();
var User = require('../model/user');
var Days = require('../model/days');
var Histories = require('../model/historys');
var mongoose = require('mongoose');
var utils = require('../utils');

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
			res.render('users', {title: '后台管理', users: users, ss: {a: a_count, n: n_count, w: w_count}, shifts: {ampm: a_str.join(), normal: n_str.join(), weekend: w_str.join()}});
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
				res.render('users', {title: '后台管理', users: users, ss: {a: a_count, n: n_count, w: w_count}, shifts: {ampm: a_str.join(), normal: n_str.join(), weekend: w_str.join()}});
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
			req.flash('success', '添加成功.');
			res.redirect('./');
		}
	});
});

router.get('/delete', function(req, res, next) {
	data = req.query.id;
	User.findByIdAndRemove(data, function(err, docs) {
		if (err) console.log(err);
		console.log('删除成功: ' + docs)
		res.redirect('./');
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

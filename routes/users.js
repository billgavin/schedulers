var express = require('express');
var router = express.Router();
var User = require('../model/user');
var mongoose = require('mongoose');

/* GET users listing. */
router.get('/', function(req, res, next) {
	User.find(function(err, users) {
		if (err) {
			console.error(err);
		}else {
			res.render('users', {title: '后台管理', users: users});
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
				console.log(users);
				res.render('users', {title: '后台管理', users: users});
			}
		});
	}else {
		req.flash('error', '用户名或密码错误！');
		res.redirect('/');
	}

});

router.post('/add', function(req, res, next) {
	data = req.body;
	data._id = new mongoose.Types.ObjectId();
	user = new User(data);
	user.save(function(err) {
		if (err) {
			console.error(err);
			req.flash('error', '添加失败！');
			res.redirect('/');
		}else {
			req.flash('success', '添加成功.');
			res.redirect('/');
		}
	});
});


module.exports = router;

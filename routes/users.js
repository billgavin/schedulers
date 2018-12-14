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
	console.log(JSON.stringify(data));
	data._id = new mongoose.Types.ObjectId();
	user = new User(data);
	user.save(function(err) {
		if (err) {
			req.flash('error', '添加失败！');
			res.redirect('/users');
		}else {
			req.flash('success', '添加成功.');
			res.redirect('/users');
		}
	});
});

router.get('/delete', function(req, res, next) {
	data = req.query.id;
	id = mongoose.Types.ObjectId(data)
	User.findByIdAndRemove(id, function(err, docs) {
		if (err) console.log(err);
		console.log('删除成功: ' + docs)
		res.redirect('/users');
	});
});

router.post('/update', function(req, res, next) {
	
});

module.exports = router;

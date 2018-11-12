var express = require('express');
var router = express.Router();
var moment = require('moment');

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

/* GET home page. */
router.get('/', function(req, res, next) {
	user = {
		id: 1,
		name: '吴乃江',
		phone: '15311423762'
	}
	schedulers = [
		scheduler('2018-11-01', 0, user),
		scheduler('2018-11-01', 1, user),
		scheduler('2018-11-01', 2, user),
		scheduler('2018-11-02', 0, user),
		scheduler('2018-11-02', 2, user),
		scheduler('2018-11-03', 3, user),
		scheduler('2018-11-04', 3, user)
	]
  	res.render('index', { title: '运维值班表', schedulers: JSON.stringify(schedulers)});
});


module.exports = router;

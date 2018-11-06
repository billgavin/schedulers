var express = require('express');
var router = express.Router();

process.env.TZ = "Asia/Shanghai";
Date.prototype.TimeZone = new Map([
	['Europe/London',0],
	['Asia/Shanghai',8],
	['America/New_York',-5]
])
Date.prototype.zoneDate = function(y, m, d, h, min){
	if(process.env.TZ == undefined){
		return new Date(y, m, d, h, min);
	}else{
		for (let item of this.TimeZone.entries()) {
			if(item[0] == process.env.TZ){
				let date = new Date(y, m, d, h, min);
				date.setHours(date.getHours()+item[1]);
				return date;
			}
		}
		return new Date();
	}
}

var date = new Date();
date.setHours(date.getHours() + 8)
console.log(date)
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();

function scheduler(id, user) {
	switch(id){
	 	case 0:
		s = {
			title: '早班: ',
			start: new Date().zoneDate(y, m, d, 7, 0),
			end: new Date().zoneDate(y, m, d, 9, 0),
			url: '#'
		};
		break;
	 	case 1:
		s = {
			title: '晚班: ',
			start: new Date().zoneDate(y, m, d, 18, 0),
			end: new Date().zoneDate(y, m, d, 23, 0),
			url: '#'
		};
		break;
	 	case 2:
		s = {
			title: '日常班: ',
			start: new Date().zoneDate(y, m, d, 9, 0),
			end: new Date().zoneDate(y, m, d, 18, 0),
			url: '#'
		};
		break;
	 	case 3:
		s = {
			title: '周末班: ',
			start: new Date().zoneDate(y, m, d, 7, 0),
			end: new Date().zoneDate(y, m, d, 23, 0),
			url: '#'
		};
		break;
	}
	return s

}

function schedulers(day) {
	switch(day) {
		case 0:
		s = [
			scheduler(0, user),
			scheduler(2, user),
			scheduler(1, user),
		]
		case 1:
		s = [scheduler(3, user)]
	}
	return s
}
/* GET home page. */
router.get('/', function(req, res, next) {

  	res.render('index', { title: '运维值班表', schedulers: JSON.stringify(schedulers)});
});

module.exports = router;

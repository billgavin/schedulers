module.exports = {
//判断一个对象是否存在于给定数组中
contains: function(arr, obj) {
	var i = arr.length;
	while (i--) {
		if (arr[i] === obj) {
			return true;
		}
	}
	return false;
},

//返回给定日期的周次
getYearWeek: function(y, m, d, flag=true) {
	var nyd = new Date(y, 0, 1).getDay();
	var days = d - 1;
	if (nyd == 0 && flag) nyd = 7;
	for (var i=1; i<m; i++) {
		days += new Date(y, i, 0).getDate();
	}
	week = Math.ceil((days + nyd) / 7);
	return week;
//	return flag ? week + 1 : week;
},


//数字按长度补前导0
padding: function(num, length) {
        for(var len = (num + "").length; len < length; len = num.length) {
            num = "0" + num;            
        }
        return num;
},

//比较两个日期大小, a>b -> true, a<=b -> false
campDate: function(a, b) {
	var d1 = new Date(a);
	var d2 = new Date(b);
	if (d1.getTime() > d2.getTime()) {
		return true;
	} else {
		return false;
	}
},

md5sum: function(content) {
	var str;
	switch(typeof(content)) {
		case 'object':
			str = JSON.stringify(content);
			break;
		case 'string':
			str = content;
			break;
		default:
			str = String(content);
	}
	return md5(str);
},
trim: function(s){
    return rtrim(ltrim(s));
},
deepCopy: deepCopy
};

function deepCopy(obj) {
	var result = Array.isArray(obj) ? [] : {};
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (typeof obj[key] === 'object') {
					result[key] = deepCopy(obj[key]);   //递归复制
				} else {
					result[key] = obj[key];
				}
			}
		}
	return result;
}


function ltrim(s){
    if(s == null) {
        return "";
    }
    var whitespace = new String(" \t\n\r");
    var str = new String(s);
    if (whitespace.indexOf(str.charAt(0)) != -1) {
        var j=0, i = str.length;
        while (j < i && whitespace.indexOf(str.charAt(j)) != -1){
            j++;
        }
        str = str.substring(j, i);
    }
    return str;
}


function rtrim(s){
    if(s == null) return "";
    var whitespace = new String(" \t\n\r");
    var str = new String(s);
    if (whitespace.indexOf(str.charAt(str.length-1)) != -1){
        var i = str.length - 1;
        while (i >= 0 && whitespace.indexOf(str.charAt(i)) != -1){
           i--;
        }
        str = str.substring(0, i+1);
    }
    return str;
}


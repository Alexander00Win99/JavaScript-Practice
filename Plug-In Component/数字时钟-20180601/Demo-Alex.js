// 1) 获取机器当前时间
// 2) 使用ES6新增Array.from()方法根据当前时间12:34:56==>字符串123456
// 3) 六个字符依次对应各个column内容
// 4) 依次找出各个column中对应数字垂直居中高亮显示(需要计算在Y轴上移动距离)
// 5) 根据数字相邻关系依次调节显示透明度

// use24Hour: 是否24小时显示
function Index(dom, use24Hour) {
	// 使用Array.from()可以将DOM元素NodeList, string, arguments装换为数组
	this.use24Hour = use24Hour;
	this.classList = ["visible", "near", "close", "far", "distant", "remote"];
	this.column = Array.from(dom);
	this.showTime();
}

// 获取时钟字符串，不足两位补齐显示：1:2:3 ==> "010203"
Index.prototype.genClockStr = function () {
	var date = new Date();
	// console.info(date.getHours(), date.getMinutes(), date.getSeconds());
	// var dateArr = [this.use24Hour ? date.getHours() : date.getHours() % 12 || 12, date.getMinutes(), date.getSeconds()]
	// var clockStr = dateArr.reduce(function(pre, next) {
	// 	return (pre + ("0" + next).slice(-2));
	// }, "")
	// console.info(clockStr);
	// return clockStr;
	return [this.use24Hour ? date.getHours() : date.getHours() % 12 || 12, date.getMinutes(), date.getSeconds()].reduce(function(pre, next) {
		return (pre + ("0" + next).slice(-2));
	}, "")
}

// n: 当前时间字符串中某位的值(参考标准，此位作为className = "visible")
// i: 时间字符串下标对应DOM列中所有数字(依次对比n，赋值相应className)
// (delta) classList: 0:"visible", 1:"near", 2:"close", 3:"far", 4:"distant", 5:"remote"
// (delta) n - i = delta(classIndex) || i - n = delta(classIndex)
Index.prototype.genClassName = function (n, i) {
	// console.info(this.classList);
	var className = this.classList.find(function (className, classIndex) {
		return classIndex === n - i || classIndex === i - n;
	})
	// console.info(className);
	return className;
}

Index.prototype.showTime = function () {
	var self = this;
	setInterval(function () {
		var clockStr = self.genClockStr();
		// console.info(clockStr);
		// console.info(self.column);
		self.column.forEach(function (ele, index) {
			var n = + clockStr[index];
			// 根据line-height = 60px => Y轴偏移
			var offset = n * 80;
			$(ele).css({"transform" : "translateY(calc(50vh - " + offset + "px - 40px))"});
			Array.from(ele.children).forEach(function (e, i) {
				var className = self.genClassName(n, i);
				$(e).attr("class", className);
			})
		})
	}, 200)
}

new Index($(".column"), true);
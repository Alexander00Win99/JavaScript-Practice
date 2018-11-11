const initalSpeed = 5;
var flag,
	timer,
	num = 0,
	speed = initalSpeed,
	go = $(".go"),
	main = $(".main"),
	colors = ["red", "green", "blue", "yellow", "cyan", "purple", "orange", "pink"];

// 新建或者重玩都会调用
function clickStart() {
	$("a").on("click", function () {
		flag = true;
		$("a").css("display", "none");
		move();
	})
}
clickStart();

// 设置(x)ms时长定时器
function move() {
	clearInterval(timer);
	timer = setInterval(function () {
		var step = parseInt(main.css("top")) + speed;
		main.css("top", step + "px");
		if (parseInt(main.css("top")) >= 0) {
			drawRow();
			// console.info("++++fuck u++++");
			main.css("top", "-150px");
		}
		distroyRow();
	}, 30);

	bindEvent();
	// while (bContinue) {
	// 	checkWrongClick() || distroyRow()
	// }
}

function drawRow() {
	var index = Math.floor(Math.random() * 4) % 4;
	var cIndex = Math.floor(Math.random() * colors.length) % colors.length;

	var oDivRow = $("<div class='row'></div>");
	for (i = 0; i < 4; i ++) {
		var oDiv = $("<div></div>");
		oDivRow.append(oDiv);
	}

	var targetDiv = $(oDivRow.children()[index]);
	targetDiv.css("background-color", colors[cIndex]);
	targetDiv.attr("class", "target");

	if (main.children().length == 0) {
		main.append(oDivRow);
	} else {
		oDivRow.insertBefore(main.children()[0]);
	}
}


// 检查是否错点
function bindEvent() {
	main.on("click", function (e) {
		if (flag) {
			console.log("e.target.className: ", e.target.className);
			console.log("e.target: ", e.target);
			console.log("$(e.target): ", $(e.target));
			console.log("e.currentTarget.className: ", e.currentTarget.className);
			console.log("e.currentTarget: ", e.currentTarget);
			console.log("$(e.currentTarget): ", $(e.currentTarget));
			
			// 注意：e.target是原生DOM元素；$(e.target)是JQuery对象。
			if ($(e.target).attr("class") == "target") {
			// if (e.target.className == "target") {
				$(e.target).css("background-color", "#fff");
				$(e.target).attr("class", "");
				// e.target.className = "";
				num ++;
			} else {
				console.log("点错地方了!")
				// main.css("top", "-150px")
				// 分值系数coefficient与方块数目呈现指数exponent关系：1-10:1; 11-20:2; 21-30:4; 31-40:8......
				displayScore();
				// flag = false;
				// return true;
			}
			// 每点十个，速度增一。
			increaseSpeed();
		}			
	})
}

// function bindEvents() {
// 	var events = {
// 		"checkWrongClick" : function () {
// 			main.on("click", function (e) {
// 				if (flag) {
// 					console.info("e.target.className: ", e.target.className);
// 					console.info("e.target: ", e.target);
// 					console.info("$(e.target): ", $(e.target));
// 					// 注意：e.target是原生DOM元素；$(e.target)是JQuery对象。
// 					if (e.target.className == "target") {
// 						$(e.target).css("background-color", "#fff");
// 						// $(e.target).attr("class", "");
// 						e.target.className = "";
// 						num ++;
// 					} else {
// 						console.log("i am fucking!")
// 						flag = false;
// 						main.css("top", "0px")
// 						displayScore();
// 						// return true;
// 					}
// 					increaseSpeed();
// 				}			
// 			})
// 		},
// 		"otherOperation" : function () {
// 			// do something;
// 		}
// 	}

// 	events.checkWrongClick();
// 	// while()
// 	console.log("wrong function: here false!")
// 	// return false;
// }

// 在行数到达6时销毁最底那行，并且检查行中是否包含漏点元素。
function distroyRow() {
	var len = main.children().length;
	if (len == 6) {
		// 检查是否漏点
		for (i = 0; i < 4; i ++) {
			if ($($(main.children()[len - 1]).children()[i]).attr("class") == "target") {
			// if (main.children()[len - 1].children[i].className == "target") {
				displayScore(num);
			}
		}
		console.log("main.children().length, before: ", main.children().length)
		$(main.children()[len-1]).remove();
		console.log("main.children().length, after: ", main.children().length)
	}
}

function increaseSpeed() {
	console.log("if num == 10 times, increase speed!")
	if (num % 10 == 0) {
		speed ++;
		console.log("speed now: ", speed);
	}
}

function displayScore() {
	flag = false;
	clearInterval(timer);
	main.css("top", "0px")
	var score = num;
	// alert("Total score: ", score);
	console.log("Current speed: ", speed);
	console.log(score);
	console.info("Total score: ", score);
	// alert("您的得分：", score);
	
	// num = 0;
	// speed = 5;/**/
	// main.off("click");
	// main.children().remove();
	// $("a").html("Restart")
	// $("a").css("display", "block");
}
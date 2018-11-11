var popstar;
var squareLen = 50;				// 单个星星方块边长
var squareColor = {0: "red", 1: "green", 2: "blue", 3: "yellow", 4: "purple"}
var cellCount = 10;				// 每行每列星星个数
var squareSet = [];				// 方块集合二维数组，取左下角作为(0, 0)顶点，由于星星消除，squareSet[i]长度可能递减
var tmpSquare = null;			// 在消灭星星过程中，记录坠落当前位置的新的星星
var gameStage = 1;				// 当前游戏关数
var scoreMission = {1: 1500, 2: 2000, 3: 2500, 4: 3000, 5: 3500, 6:4000}
var scoreBase = 5;				// 每个星星基础分值
var scoreStep = 10;				// 多个星星加分步长
var totalScore = 0;				// 当前得分
var scoreRecord = [0, 0, 0];	// 得分记录的前三名
var lastChosenStars = [];		// 上次选中的相邻同色星星
var currentChosenStars = [];	// 本次选中的相邻同色星星
var flag = true;				// 加锁点击事件，在消灭星星过程中，禁止点击操作和鼠标移入操作
var timer = null;

window.onload = function () {
	init();
}

function init() {
	popstar = document.getElementById("pop_star");
	popstar.children[0].innerHTML = "第" + gameStage + "关，过关分数: " + scoreMission[gameStage];
	generatePanel();
	refreshPanel();
}

function generatePanel() {
	for (var i = 0; i < cellCount; i ++) {
		squareSet[i] = [];
		for (var j = 0; j < cellCount; j ++) {
			var square = generateSquare(squareColor[Math.floor(Math.random() * 5)], i, j);
			// 星星鼠标悬停事件
			square.addEventListener("mouseover", function () {
				console.log("move");
				mouseOver(this);
			})
			// 星星鼠标点击事件
			square.addEventListener("click", function () {
				console.log("click");
				// showCurrentScore();
				starDistinguish();
				// 纵向下落
				starFall();
				// 横向左移
				starShift();
				// 产生null需要重新刷新显示
				refreshPanel();
				showCurrentScore();

				if (isFinished()) {
					if (totalScore >= scoreMission[gameStage]) {
						gameStage ++;
						alert("闯关成功，进入第" + gameStage + "关！");
					} else {
						alert("闯关失败，再来一局？");
					}
				} else {
					currentChosenStars = [];
					lastChosenStars = [];
				}
			})
			squareSet[i][j] = square;			
			// 先添加事件，后添加元素，避免加载DOM元素以后时间尚未完成绑定问题
			popstar.appendChild(square);
		}
	}
}

function refreshPanel() {
	for (var i = 0; i < squareSet.length; i ++) {
		for (var j = 0; j < squareSet[i].length; j ++) {
			// 兼容处理，优良习惯
			if (squareSet[i][j] == null) {
				continue;
			}
			// starFall()|starShift()以后需要更新row|col
			squareSet[i][j].row = i;
			squareSet[i][j].col = j;
			squareSet[i][j].style.left = squareSet[i][j].col * squareLen + "px";
			squareSet[i][j].style.bottom = squareSet[i][j].row * squareLen + "px";
			squareSet[i][j].style.backgroundImage = "url('./img/" + squareSet[i][j].color + ".png')";
			squareSet[i][j].style.backgroundSize = "cover";
			squareSet[i][j].style.transition = "left 0.2s, bottom 0.2s";
			squareSet[i][j].style.transform = "scale(0.95)";
		}
	}
}

function generateSquare(color, row, col) {
	var square = document.createElement("div");
	square.style.position = "absolute";
	square.style.width = squareLen + "px";
	square.style.height = squareLen + "px";
	square.style.display = "inline-block";
	square.style.boxSizing = "border-box";
	square.style.borderRadius = "12px";
	square.color = color;
	square.row = row;
	square.col = col;
	return square;
}

function mouseOver(square) {
	var arr = [];
	currentChosenStars = getSimilarNeighbour(square, arr);
	// 当前星星集合为空或者只含单个星星
	if (currentChosenStars.length <= 1) {
		currentChosenStars = [];
		lastChosenStars = [];
		return;
	} else { // 当前星星集合包含多颗星星
		// 上次星星集合包含多颗星星
		if (lastChosenStars.length >= 2) {
			// 当前星星集合就是上次星星集合，无须额外处理，直接返回
			if (currentChosenStars.indexOf(lastChosenStars[0]) != -1) {
				return;
			} else { // 当前星星集合和上次不同，更新闪烁，显示此次分值，更新lastChosenStars = currentChosenStars
				stopTwinkle(lastChosenStars);
				startTwinkle(currentChosenStars);
				showSelectedScore();
				lastChosenStars = currentChosenStars;
				return;
			}
		} else { // 上次星星集合为空或者只含单个星星
			startTwinkle(currentChosenStars);
			showSelectedScore();
			lastChosenStars = currentChosenStars;
			return;
		}
	}
}

// 递归获取某个星星相邻同色星星
function getSimilarNeighbour(square, similarNeighbour) {
	if (square == null)
		return;
	var leftSquare = null,
		rightSquare = null,
		upSquare = null,
		downSquare = null;
	var res = similarNeighbour || [];
	res.push(square);

	if (square.col > 0) {
		leftSquare = squareSet[square.row][square.col - 1];
		if (leftSquare && leftSquare.color == square.color && res.indexOf(leftSquare) == -1)
			getSimilarNeighbour(leftSquare, res);
	}
	if (square.col < cellCount - 1) {
		rightSquare = squareSet[square.row][square.col + 1];
		if (rightSquare && rightSquare.color == square.color && res.indexOf(rightSquare) == -1)
			getSimilarNeighbour(rightSquare, res);
	}
	if (square.row < cellCount - 1) {
		upSquare = squareSet[square.row + 1][square.col];
		if (upSquare && upSquare.color == square.color && res.indexOf(upSquare) == -1)
			getSimilarNeighbour(upSquare, res);
	}
	if (square.row > 0) {
		downSquare = squareSet[square.row - 1][square.col];
		if (downSquare && downSquare.color == square.color && res.indexOf(downSquare) == -1)
			getSimilarNeighbour(downSquare, res);
	}
	return res;
}

function startTwinkle(arr) {
	var num = 0;
	if (timer != null) {
		clearInterval(timer);
	}
	timer = setInterval(function () {
		for (var i = 0; i < arr.length; i ++) {
			arr[i].style.border = "2px solid golden";
			arr[i].style.transform = "scale(" + (0.90 + 0.05 * Math.pow(-1, num)) + ")";
		}
		// num递增->导致奇偶交替->scale(0.95)|scale(0.85)实现交替震荡
		num ++;
	}, 200);
}

function stopTwinkle(arr) {
	if (timer != null) {
		clearInterval(timer);
	}
	for (var i = 0; i < arr.length; i ++) {
		arr[i].style.border = "0px solid grey";
		arr[i].style.transform = "scale(o.95)";
	}
}

function showSelectedScore() {
	var score = calculateSelectedScore();
	popstar.children[2].innerHTML = currentChosenStars.length + "星" + score + "分";
	popstar.children[2].style.transition = null;
	popstar.children[2].style.opacity = 1;
	setTimeout(function () {
		popstar.children[2].style.transition = "opacity 1s";
		popstar.children[2].style.opacity = 0;
	}, 3000)
}

function showCurrentScore() {
	var score = calculateSelectedScore();
	totalScore += score;
	popstar.children[1].innerHTML = "当前分数: " + totalScore;
}

function calculateSelectedScore() {
	var score = 0;
	for (var i = 0; i < currentChosenStars.length; i ++) {
		score += scoreBase + i * scoreStep;
	}
	return score;
}

function starDistinguish() {
	for (var i = 0; i < currentChosenStars.length; i ++) {
		console.log(squareSet[currentChosenStars[i].row][currentChosenStars[i].col]);
		squareSet[currentChosenStars[i].row][currentChosenStars[i].col] = null;
		console.log(squareSet[currentChosenStars[i].row][currentChosenStars[i].col]);
		popstar.removeChild(currentChosenStars[i]);
	}
}

function starFall() {
	for (var j = 0; j < squareSet[0].length; j ++) {
		var pointer = 0;
		for (var i = 0; i < squareSet.length; i ++) {
			if (squareSet[i][j] != null) {
				if (pointer != i) {
					console.log(pointer, i);
					squareSet[pointer][j] = squareSet[i][j];
					squareSet[pointer][j].row = pointer;
					squareSet[i][j] = null;
				}
				// 当此处星星！=null时pointer++ ==> 总是：pointer <= i
				pointer ++;
			}
		}
	}
}

function starShift() {
	for (var i = 0; i < squareSet[0].length; ) {
		// 某列从上到下已空，后续每列需要整体左移
		if (squareSet[0][i] == null) {
			for (var j = 0; j < cellCount; j ++) {
				squareSet[j].splice(i, 1);
			}
			// 当前位置为空，删除元素以后，重新计算数组长度以后重新运行当前下标函数体
			continue;
		}
		i ++;
	}
}

function isFinished() {
	var bool = true;
	for (var i = 0; i < squareSet.length; i ++) {
		for (var j = 0; j < squareSet[i].length; j ++) {
			var arr = [];
			getSimilarNeighbour(squareSet[i][j], arr);
			if (arr.length > 1) {
				bool = false;
				return bool;
			}
		}
	}
	return bool;
}

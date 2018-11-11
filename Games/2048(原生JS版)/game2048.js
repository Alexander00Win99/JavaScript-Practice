// (function game2048(rows, cols) {
	var game2048 = document.getElementById("game2048"),
		// rows = arguments[0] || 4,
		// cols = arguments[1] || 4,
		currentScore,
		highestScore,
		lock = true,
		rows = 4,
		cols = 4,
		squareLen = 100,
		spacing = 12,
		isChanged = false,
		// 二维数组，每个元素对应一个特定行列位置的square方块，无论当前square方块是否为零。
		boardSet = [],
		// 二维数组，当前行列位置的square方块非零对应元素存储dom元素，为零对应元素置null。
		squareSet = [],
		// 二维数组，当前行列位置的square方块非零，记录数字，否则置零。
		valueSet = [],
		colorMap = {
			0: "brown",
			2: "green",
			4: "blue",
			8: "yellow",
			16: "cyan",
			32: "purple",
			64: "orange",
			128: "pink",
			256: "red",
			512: "ivory",
			1024: "navy",
			2048: "grey",
			4096: "silver",
			8192: "gold"
		},
		directionEnum = {
			up: {key: "top", des: "up", x: 0, y: -1},
			down: {key: "top", des: "down", x: 0, y: 1},
			left: {key: "left", des: "left", x: -1, y: 0},
			right: {key: "left", des: "right", x: 1, y: 0}
		};

	window.onload = function () {
		initBoard(rows, cols);
	}

	function initBoard(rows, cols) {
		game2048.style.height = rows * squareLen + (rows + 1) * spacing + "px";
		game2048.style.width = cols * squareLen + (cols + 1) * spacing + "px";
		game2048.style.backgroundColor = "chocolate";
		game2048.style.borderRadius = "18px";
		for (var i = 0; i < rows; i ++) {
			boardSet[i] = [];
			squareSet[i] = [];
			valueSet[i] = [];
			for (var j = 0; j < cols; j ++) {
				boardSet[i][j] = generateSquare(0, i, j);
				game2048.appendChild(boardSet[i][j]);
				squareSet[i][j] = null;
				valueSet[i][j] = 0;
			}
		}
		generateRandomNum();
		generateRandomNum();
		document.addEventListener("keydown", function (e) {
			if (lock) {
				// 按方向键以外按键不予响应；
				// 按方向键但是当前盘面不会合并数字不予响应；
				lock = false;
				switch (e.key) {
					case "ArrowUp": move(directionEnum.up); break;
					case "ArrowDown": move(directionEnum.down); break;
					case "ArrowLeft": move(directionEnum.left); break;
					case "ArrowRight": move(directionEnum.right); break;
					default: {
						lock = true;
					};
				}
			} else {
				return;
			}
		});
	}

	function generateSquare(value, row, col) {
		var square = document.createElement("div");
		var top = row * squareLen + (row + 1) * spacing;
		var left = col * squareLen + (col + 1) * spacing;
		square.num = value;
		square.row = row;
		square.col = col;
		// square.style.id = row + "-" + col;
		square.style.top = top + "px";
		square.style.left = left + "px";
		square.style.width = squareLen + "px";
		square.style.height = squareLen + "px";
		square.style.borderRadius = "12px";
		square.style.background = colorMap[value];
		square.style.textAlign = "center";
		square.style.lineHeight = squareLen + "px";
		square.style.fontSize = 0.4 * squareLen + "px";
		if (value > 0) {
			// square.style.id = "row" + "-" + "col";
			square.innerHTML = "" + value;
		}
		return square;
	}

	// 初始生成两个(有效单次移动生成一个)随机2|4的新square方块；
	// 生成square方块以后，append到game2048上面，所以可以看到game2048.childElementCount不断递增；
	// 如果需要维持game2048子节点数=== (rows * cols)，需要更新整体设计，替换game2048原来行列位置的square方块。
	function generateRandomNum() {
		var rand = Math.random() < 0.5 ? 2 : 4;
		for (;;) {
			var randRowIdx = Math.floor(Math.random() * rows);
			var randColIdx = Math.floor(Math.random() * cols);
			// var obsoletedSquare =  document.getElementById(randRowIdx + "-" + randColIdx);
			if (valueSet[randRowIdx][randColIdx] == 0) {
				var square = generateSquare(rand, randRowIdx, randColIdx);
				squareSet[randRowIdx][randColIdx] = square;
				valueSet[randRowIdx][randColIdx] = rand;
				// game2048.removeChild(obsoletedSquare);
				game2048.appendChild(square);
				return true;
			}
		}
	}

	function generateNullSet(type) {
		var nullSet = [];
		for (var i = 0; i < rows; i ++) {
			nullSet[i] = [];
			for (var j = 0; j < cols; j ++) {
				if (type == "squareSet") {
					nullSet[i][j] = null;
				} else if (type == "valueSet") {
					nullSet[i][j] = 0;
				} else {
					return;
				}
			}
		}
		return nullSet;
	}

	function move(direction) {
		// STEP-1: 左右遍历各行或者上下遍历各列，提取同行同列所有非空square方块生成新的数组；
		// STEP-2: 数组之中同值相邻square方块进行同值合并(next指针)；
		// STEP-3: 实现上下左右移动的动画效果；
		// var mainAxis,
		// 	crossAxis,
		// 	mainAxisLen,
		// 	crossAxisLen;
		// switch (direction.des) {
		// 	case "up": align = "vertical"; order = "increase"; mainAxis = "y"; crossAxis = "x"; mainAxisLen = rows; crossAxisLen = cols; break;
		// 	case "down": align = "vertical"; order = "decrease"; mainAxis = "y"; crossAxis = "x"; mainAxisLen = rows; crossAxisLen = cols; break;
		// 	case "left": align = "horizontal"; order = "increase"; mainAxis = "x"; crossAxis = "y"; mainAxisLen = cols; crossAxisLen = rows; break;
		// 	case "right": align = "horizontal"; order = "decrease"; mainAxis = "x"; crossAxis = "y"; mainAxisLen = cols; crossAxisLen = rows; break;
		// 	default: 
		// }
		// 左右移动：水平方向逐行扫描非零方块，按行生成数组(左则正序压入数组，右则反序)
		// 上下移动：垂直方向逐列扫描非零方块，按列生成数组(上则正序压入数组，下则反序)
		// for (var i = 0; i < crossAxisLen; i ++) {
		// 	var arr = [];
		// 	for (var j = 0; j < mainAxisLen; j ++) {
		// 		if (align == "horizontal") {
		// 			// squareSet[i][j] && arr.push(squareSet[i][j]);
		// 			if (squareSet[i][j] != null) {
		// 				arr.push(squareSet[i][j]);
		// 			}
		// 		}
		// 		if (align == "vertical") {
		// 			// squareSet[j][i] && arr.push(squareSet[j][i]);
		// 			if (squareSet[j][i] != null) {
		// 				arr.push(squareSet[j][i]);
		// 			}
		// 		}	
		// 	}
		// 	// 预合并新生成数组中相邻同值元素(数组长度可能减小)
		// 	arr = fusionMerge(arr);
		// 	if (order == "increase") {
		// 		for (var k = 0; k < arr.length; k ++) {
		// 			tmpSquareSet[i][k] = arr[k]
		// 		}
		// 	}
		// 	if (order == "decrease") {
		// 		for (var k = 0; k < arr.length; k ++) {
		// 			tmpSquareSet[i][mainAxisLen - k - 1] = arr[k]
		// 		}
		// 	}
		// }
		var tmpSquareSet = generateNullSet("squareSet");
		if (direction == directionEnum.up) {
			for (var j = 0; j < cols; j ++) {
				var arr = [];
				for (var i = 0; i < rows; i ++) {
					if (squareSet[i][j] != null) {
						arr.push(squareSet[i][j]);
					}
				}
				arr = fusionMerge(arr);
				for (var k = 0; k < rows; k ++) {
					if (arr[k]) {
						tmpSquareSet[k][j] = arr[k];
					}
				}
			}
		} else if (direction == directionEnum.down) {
			for (var j = 0; j < cols; j ++) {
				var arr = [];
				for (var i = 0; i < rows; i ++) {
					if (squareSet[rows - i - 1][j] != null) {
						arr.push(squareSet[rows - i - 1][j]);
					}
				}
				arr = fusionMerge(arr);
				for (var k = 0; k < rows; k ++) {
					// arr本身不足对应行列长度，并且经过合并以后，可能长度再行减小，因此需要判断arr[k]是否存在。
					if (arr[k]) {
						tmpSquareSet[rows - k - 1][j] = arr[k];
					}
				}
			}
		} else if (direction == directionEnum.left) {
			for (var i = 0; i < rows; i ++) {
				var arr = [];
				for (var j = 0; j < cols; j ++) {
					if (squareSet[i][j] != null) {
						arr.push(squareSet[i][j]);
					}
				}
				arr = fusionMerge(arr);
				for (var k = 0; k < cols; k ++) {
					if (arr[k]) {
						tmpSquareSet[i][k] = arr[k];
					}
				}
			}
		} else if (direction == directionEnum.right) {
			for (var i = 0; i < rows; i ++) {
				var arr = [];
				for (var j = 0; j < cols; j ++) {
					if (squareSet[i][cols - j - 1] != null) {
						arr.push(squareSet[i][cols - j - 1]);
					}
				}
				arr = fusionMerge(arr);
				for (var k = 0; k < cols; k ++) {
					if (arr[k]) {
						tmpSquareSet[i][cols - k -1] = arr[k];
					}
				}
			}
		}
		square方块移动合并animation动画
		for (var i = 0; i < rows; i ++) {
			for (var j = 0; j < cols; j ++) {
				if (tmpSquareSet[i][j] == null) {
					continue;
				}
				tmpSquareSet[i][j].style.transition = direction.key + " 0.2s";
				tmpSquareSet[i][j].style.top = i * squareLen + (i + 1) * spacing + "px";
				tmpSquareSet[i][j].style.left = j * squareLen + (j + 1) * spacing + "px";
				if (tmpSquareSet[i][j].next) {
					tmpSquareSet[i][j].next.style.transition = direction.key + " 0.2s";
					tmpSquareSet[i][j].next.style.top = i * squareLen + (i + 1) * spacing + "px";
					tmpSquareSet[i][j].next.style.left = j * squareLen + (j + 1) * spacing + "px";
				}
			}
		}

		setTimeout(function() {
			refreshBoard(tmpSquareSet);
			if (isChanged) {
				generateRandomNum();
			}
			lock = true;
			isChanged = false;
			if (gameOver()) {
				alert(`Game Over! Highest score is: ${highestScore}, your score is: ${score}`);
			}
		}, 300);
	}

	// 合并相邻同值squre方块，返回新的数组(长度改变)。<-键示例如下：
	// 2 2 2 2 ==> 4 4
	// 2 2 4 4 ==> 4 8
	// 2 4 4 4 ==> 2 8 4
	// 2 4 4 8 ==> 2 8 8
	// 2 4 8 8 ==> 2 4 16
	function fusionMerge(arr) {
		var res = [];
		if (arr.length == 0) {
			return [];
		}
		res.push(arr[0]);
		for (var i = 1; i < arr.length; i ++) {
			if (res[res.length - 1].num == arr[i].num && (!res[res.length - 1].next || res[res.length - 1].next == null)) {
				res[res.length - 1].next = arr[i];
			} else {
				res.push(arr[i]);
			}
		}
		return res;
	}

	// 重新刷新盘面，相邻同值square方块进行合并fusion聚变(fission裂变)以后，同值square方块放在next指针里面，为了保持一致cosistency，需要更新具有next属性的square方块的num显示。
	function refreshBoard(transientSquareSet) {
		// 更新全局squareSet
		var transientValueSet = generateNullSet("valueSet");
		console.log(transientSquareSet, transientValueSet);
		squareSet = generateNullSet("squareSet");
		for (var i = 0; i < rows; i ++) {
			for (var j = 0; j < cols; j ++) {
				if (transientSquareSet[i][j]) {
					if (transientSquareSet[i][j].next) {
						var tmpSquare = generateSquare(transientSquareSet[i][j].num * 2, i, j);
						squareSet[i][j] = tmpSquare;
						game2048.append(tmpSquare);
						game2048.removeChild(transientSquareSet[i][j].next);
						game2048.removeChild(transientSquareSet[i][j]);
					} else {
						var tmpSquare = generateSquare(transientSquareSet[i][j].num, i, j);
						squareSet[i][j] = tmpSquare;
						game2048.append(tmpSquare);
						game2048.removeChild(transientSquareSet[i][j]);
					}
					if (valueSet[i][j] != squareSet[i][j].num) {
						isChanged = true;
					}
					transientValueSet[i][j] = squareSet[i][j].num;
				} else {
					transientValueSet[i][j] = 0;
				}
			}
		}
		valueSet = transientValueSet;
	}

	function gameOver() {
		for (var i = 0; i < rows; i ++) {
			for (var j = 0; j < cols; j ++) {
				// 盘面之中尚有空位
				if (squareSet[i][j] == null) {
					return false;
				} else if (squareSet[i][j + 1] && squareSet[i][j + 1].num == squareSet[i][j].num || squareSet[i + 1] && squareSet[i + 1][j] && squareSet[i + 1][j].num == squareSet[i][j].num) {
					return false;
				}
				// 上下左右相邻square方块元素数值相等可以合并
				// console.log(i,j,squareSet[i][j],squareSet[i][j+1],squareSet[i+1][j])
				console.log(i,j,squareSet[i][j])
				console.log(squareSet[i][j],squareSet[i][j+1],squareSet[i+1][j])
				console.log(i,j,squareSet[i][j],squareSet[i][j].num,squareSet[i][j+1],squareSet[i][j+1].num,squareSet[i+1][j],squareSet[i+1][j].num)
				// if (squareSet[i][j + 1] && squareSet[i][j + 1].num == squareSet[i][j].num || squareSet[i + 1] && squareSet[i + 1][j] && squareSet[i + 1][j].num == squareSet[i][j].num) {
				// 	return false;
				// }
			}
		}
		return true;
	}
// })()

var freecell;								// 整个游戏桌面
var head;									// 游戏头部区域
var area;									// 游戏区域
var cardCache = [];							// 扑克中转区域
var cardCacheX = [0, 120, 240, 360];		// 中转区域X坐标
var cardCacheY = 20;						// 中转区域Y坐标
var cardCollect = [];						// 扑克收集区域
var cardCollectX = [760, 880, 1000, 1120];	// 收集区域X坐标
var cardCollectY = 20;						// 收集区域Y坐标
var poker = [];								// 整副扑克52张带花纸牌+2张王
var cardWidth = 80;
var cardHeight = 120;
var cardCount = 13;							// 每种花色13张纸牌
var cardTypeEnum = {CARD_SITE: "card_site", CARD: "card"};			// 2种类型
var cardAssortmentEnum = ["spade", "heart", "club", "diamond"];		// 4种花色(assortment/suit/flower color)
var cardLineArr;							// 八个纸牌摆放队列
var movingCard = null;						// 移动的纸牌
var movingFrom = null;						// 移动的纸牌所属队列

window.onload = function() {
	init();
}

function init() {
	freecell = document.getElementById("freecell");
	head = document.getElementById("game_head");
	area = document.getElementById("game_area");
	initPoker();
	initCardCache();
	initCardCollect();
	initGameArea();
}

function initPoker() {
	// 顺序生成一副扑克的每张纸牌generate every card of (a deck of playing card)
	// poker只是playing card的一种，多与赌博gambling相关。suit|assortment|flower color
	// 四种花色依次代表：黑桃-和平 红心-爱情 草花-幸运 方片-财富，花人-face cards|court cards
	// 洗牌-shuffle 切牌-cut 发牌-deal 庄家-banker 玩家-hand 赢-trump 花人：King + Queen + Jack
	// 黑桃K-大卫David 红桃K-查理一世Charlemagne 草花K-亚历山大Alexander 方片K-凯撒Caesar
	// 黑桃Q-帕拉斯·雅典娜Athena 红桃Q-朱迪斯Judith(旧约人物，杀死侵略军将领，拯救民族) 草花Q-阿金尼(Argine-Regina女王单词移序-手持蔷薇花-代表白色蔷薇花约克王族VS红色蔷薇花兰开斯特王族->蔷薇战争和解) 方片Q-莱克尔Rachel(旧约人物，雅各Jacob的妻子，约瑟夫和本杰明的母亲，雅各十二个儿子建立了以色列十二部族)
	// 黑桃J-奥吉尔Ogier(查理一世的侍从十二帕拉丁Paladin圣骑士之一，丹麦王子) 红桃J-拉海尔La Hire(查理七世的侍从，英法百年战争时期的指挥官，圣女贞德的战友) 草花J-兰斯洛特Lancelot(亚瑟王圆桌武士的第一勇士) 方片J-赫克托Hector(或说罗兰-查理一世的侍从)
	for (var i = 0; i < cardAssortmentEnum.length; i ++) {
		for (var j = 1; j <= cardCount; j ++) {
			// var tmpCard = genCard(cardTypeEnum.CARD, head.getBoundingClientRect().width / 2 - cardWidth / 2, 20);
			var tmpCard = genCard(cardTypeEnum.CARD, area.getBoundingClientRect().width / 2 - cardWidth / 2, -140);
			// var tmpCard = genCard(head.getBoundingClientRect().left + head.getBoundingClientRect().width / 2 - cardWidth / 2, 20);
			tmpCard.assortment = cardAssortmentEnum[i];
			tmpCard.suit = i;
			tmpCard.num = j;
			poker.push(tmpCard);
			// head.appendChild(tmpCard);
			area.appendChild(tmpCard);
		}
	}
	// 洗牌shuffle
	poker.sort(function (a, b) {
		return (Math.random() < 0.5) ? -1 : 1;
	});
	// 按照当前牌序依次升序赋予z-index
	for (var i = 0; i < poker.length; i ++) {
		// 倒序排列使得发牌呈现从上而下视觉效果
		poker[i].style.zIndex = 100 - i;
	}
}

function initCardCache() {
	for (var i = 0; i < cardCacheX.length; i ++) {
		var tmpCardCache = genCard(cardTypeEnum.CARD_SITE, cardCacheX[i], cardCacheY);
		tmpCardCache.push = function (card) {
			if (this.card) {
				moveBack();
				return;
			}
			this.card = card;
			moveCard(card, this.getBoundingClientRect().left, this.getBoundingClientRect().top, 0, this, 0);
		}
		tmpCardCache.remove = function () {
			this.card = null;
		}
		cardCache.push(tmpCardCache);
		head.appendChild(tmpCardCache);
	}
}

function initCardCollect() {
	for (var i = 0; i < cardCollectX.length; i ++) {
		var tmpCardCollect = genCard(cardTypeEnum.CARD_SITE, cardCollectX[i], cardCollectY);
		tmpCardCollect.count = 0;
		tmpCardCollect.push = function (card, delay) {
			moveCard(card, this.getBoundingClientRect().left, this.getBoundingClientRect().top, delay, this, this.count);
			this.count ++;
		}
		cardCollect.push(tmpCardCollect);
		head.appendChild(tmpCardCollect);
	}
}

function initGameArea() {
	cardLineArr = document.getElementsByClassName("card_line");
	var len = cardLineArr.length;
	for (var i = 0; i < len; i ++) {
		cardLineArr[i].count = 0;
		cardLineArr[i].index = i;
		cardLineArr[i].push = function (card, delay) {
			moveCard(card, this.getBoundingClientRect().left - area.getBoundingClientRect().left + this.getBoundingClientRect().width / 2 - cardWidth / 2, this.count * 36, delay, this, this.count);
			card.style.backgroundImage = "url(./img/" + card.assortment + "_" + card.num.toString(16) + ".png)";
			card.next = null;
			this.count ++;
			if (this.lastCard) {
				this.lastCard.next = card;
			} else {
				this.firstCard = card;
			}
			this.lastCard = card;
		}
		cardLineArr[i].remove = function (card) {
			var pointer = this.firstCard;
			if (pointer == card) {
				this.firstCard = null;
				this.lastCard = null;
			} else {
				while (pointer.next != card) {
					pointer = pointer.next;
				}
				this.lastCard = pointer;
				pointer.next = null;
			}
			pointer = card;
			while (pointer) {
				// ????????????????????????????????????????
				// pointer.count = 0;
				// ????????????????????????????????????????
				pointer.queue = null;
				this.count --;
				pointer = pointer.next;
			}
		}
	}
}

function genCard(cardType, left, top) {
	var card = document.createElement("div");
	card.classList.add(cardType);
	card.style.left = left + "px";
	card.style.top = top + "px";
	return card;
}

// (x, y)是card移动的目标位置；delay是单张card的移动动作延迟时间；queue是
// card移入的目标队列，可以包括，cardLineArr[i]，cardCache[i]，cardCollect[i]；
// zIndex控制card在目标队列中视觉层次先后。
function moveCard(card, x, y, delay, queue, zIndex) {
	card.style.transition = "left 0.1s ease-in-out " + delay + "s, top 0.1s ease-in-out " + delay + "s";
	card.style.left = x + "px";
	card.style.top = y + "px";
	card.queue = queue;
	card.zIndex = zIndex;
	card.addEventListener("transitionend", function () {
		this.style.zIndex = this.zIndex;
		this.style.transition = null;
	});
}

function dealCard() {
	for (i = 0; i < poker.length; i ++) {
		cardLineArr[i % cardLineArr.length].push(poker[i], 0.1 * i);
		poker[i].addEventListener("mousedown", function (e) {
			console.log("鼠标按下！")
			if (!checkPickUpRule(this)) {
				return;
			}
			movingCard = this;
			console.log("movingCard: ", movingCard);
			movingFrom = this.queue;
			console.log("movingFrom: ", movingFrom);
		})
	}
}

function moveBack() {
	var cardArr = getSubsequentCardArr(movingCard);
	for (var i = 0; i < cardArr.length; i ++) {
		movingFrom.push(cardArr[i], 0.1);
	}
	movingCard = null;
	movingFrom = null;
}

function autoCollect() {
	var flag = true;
	var count = 0;
	var card = null;
	while (flag) {
		flag = false;
		for (var i = 0; i < cardLineArr.length; i ++) {
			card = cardLineArr[i].lastCard;
			if (card && card.num - cardCollect[card.suit].count == 1) {
				flag = true;
				cardLineArr[i].remove(card);
				cardCollect[card.suit].push(card, 0.1 * count);
				count ++;
				console.log("花色: " + card.suit + "牌值: " + card.num + "完成自动回收!");
			}
		}
		for (var i = 0; i < cardCache.length; i ++) {
			card = cardCache[i].card;
			if (card && card.num - cardCollect[card.suit].count == 1) {
				flag = true;
				cardCache[i].remove(card);
				cardCollect[card.suit].push(card, 0.1 * count);
				count ++;
				console.log("花色: " + card.suit + "牌值: " + card.num + "完成自动回收!");
			}
		}
	}
	if (gameVictory())
		alert("恭喜获胜，再来一局？");
}

// 获取某列下面某个纸牌开始的后面所有纸牌(某个纸牌后面纸牌不一定花色相异数字递减)
function getSubsequentCardArr(card) {
	var result = [];
	var pointer = card;
	while (pointer) {
		result.push(pointer);
		pointer = pointer.next;
	}
	return result;
}

function checkPutDownRule(cardLine) {
	console.log(cardLine.lastCard, cardLine.lastCard.num, movingCard.suit)
	if (cardLine.lastCard == null || (cardLine.lastCard.num - movingCard.num == 1) && (cardLine.lastCard.suit + movingCard.suit) % 2 == 1)
		return true;
}

function checkPickUpRule(card) {
	var pointer = card;
	while (pointer.next) {
		if (pointer.num - pointer.next.num == 1 && (pointer.suit + pointer.next.suit) % 2 == 1) {
			pointer = pointer.next;
			continue;
		} else {
			return false;
		}
	}
	return true;
}

function gameStart(dom) {
	// 发牌deal 切牌cut
	dealCard();
	dom.remove();
	// 在鼠标松开时，判断是否能放入一张或者一串纸牌(调试：打印当前队列牌数)
	document.addEventListener("mouseup", function (e) {
		// console.log(e);
		console.log("鼠标抬起");
		console.log(movingCard);
		if (movingCard == null) {
			return;
		}
		for (var i = 0; i < cardLineArr.length; i ++) {
			var lineRect = cardLineArr[i].getBoundingClientRect();
			if (e.clientX > lineRect.left && e.clientX < lineRect.left + lineRect.width && e.clientY > lineRect.top && e.clientY < lineRect.top + lineRect.height) {
				console.log("i, cardLineArr[i]", i, cardLineArr[i]);
				console.log("判断能否此列放牌：", checkPutDownRule(cardLineArr[i]));
				if (!checkPutDownRule(cardLineArr[i])) {
					console.log("检查不能放下，moveback")
					moveBack();
				}
				console.log("即将放入cardLineArr: " + i + ", 当前牌数count: " + cardLineArr[i].count);
				var cardArr = getSubsequentCardArr(movingCard);
				console.log("当前移动单张牌movingCard: ", movingCard);
				console.log("当前移动牌组cardArr: ", cardArr);
				for (var j = 0; j < cardArr.length; j ++) {
					cardLineArr[i].push(cardArr[j], 0.1);
					console.log("放入cardLineArr: " + i + "纸牌: 花色" + cardArr[j].suit + "牌值" + cardArr[j].num + ", 本列当前牌数count: " + cardLineArr[i].count);
				}
				movingCard = null;
				movingFrom = null;
				autoCollect();
				return;
			}
		}
		for (var i = 0; i < cardCache.length; i ++) {
			var cacheRect = cardCache[i].getBoundingClientRect;
			if (e.clientX > cacheRect.left && e.clientX < cacheRect.left + cacheRect.width && e.clientY > cacheRect.top && e.clientY < cacheRect.top + cacheRect.height) {
				if (movingCard.next) {
					moveBack();
					return;
				}
				cardCache[i].push(movingCard);
				movingCard = null;
				movingFrom = null;
				autoCollect();
				return;
			}
		}
		moveBack();
		return;
	});
	document.addEventListener("mousemove", function (e) {
		// console.log(e);
		// console.log("鼠标按下");
		console.log(movingCard);
		if (movingCard != null) {
			var pointer = movingCard;
			var count = 0;
			while (pointer) {
				pointer.style.left = (e.clientX - 20) + "px";
				pointer.style.left = (e.clientY + count * 25 - 20) + "px";
				pointer.style.zIndex = 100 + count;
				pointer = pointer.next;
				count ++;
			}
		}
	});
}

function gameOver() {

}

function gameVictory() {
	var total = 0;
	for (var i = 0; i < cardCache.length; i ++) {
		total = total + cardCache[i].count;
	}
	return total == cardCount * cardAssortmentEnum.length ? true: false;
}

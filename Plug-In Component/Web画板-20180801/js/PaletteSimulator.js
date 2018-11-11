/**
 * Plaette Simulator
 * Author: Alexander Wen
 * Canvas API
 **/

var obj = {
	cavs : $(".cavs"),
	ctx : $(".cavs").get(0).getContext("2d"),
	color : $("#pickColor"),
	line : $("#setLine"),
	cleanBoard : $("#cleanBoard"),
	eraser : $("#eraser"),
	rescind : $("#undo"),
	// imgArr数组保存之前snapshot截屏，使用pop数组恢复上次截屏实现撤销功能
	imgArr : [],
	imgData : null,
	// 是否允许绘制图形
	flag : false,
	// 判断是否擦除功能，擦出操作完毕需要恢复原来样式
	bEraser : false,
	curStyle : null,
	// var curStyle = ctx.strokeStyle
	init : function () {
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.draw();
		this.bindEvent();
	},
	draw : function () {
		var self = this;
		var cavs = this.cavs;
		var ctx = this.ctx;
		var cavsL = this.cavs.offset().left;
		var cavsT = this.cavs.offset().top;
		/* hasMoved用以判断mousedown之后mouseup之前是否发生mousemove动作，
		 * 规避只是点击左键也会保存snapshot截屏导致大量冗余截屏的问题，只有
		 * 出现过了mousemove的mouseup才算一次有效绘制动作，才需push数组保存
		 * 上次snapshot截屏 */
		var hasMoved = false;
		var imgData = null;

		this.cavs.mousedown(function (e) {
			self.flag = true;
			// 每次点击左键，无论后面是否绘制图形，都会生成一个新的imgData
			// 如果绘制图形，保存imgData，单纯点击而不绘图，后面imgData并未更新，可以直接覆盖前面上次点击时的imgData
			imgData = ctx.getImageData(0, 0, cavs[0].width, cavs[0].height);
			if (!self.bEraser) {
				ctx.strokeStyle = self.curStyle;
			}
			var cavsX = e.pageX - cavsL;
			var cavsY = e.pageY - cavsT;
			ctx.beginPath();
			ctx.moveTo(cavsX, cavsY);

			cavs.mousemove(function (e) {
				// 需要判断self.flag，没有mousedown点击左键，就不允许绘图
				if (self.flag) {
					hasMoved = true;
					ctx.lineTo(e.pageX - cavsL, e.pageY - cavsT);
					ctx.stroke();
				}
			});

			cavs.mouseup(function (e) {
				// 绘图动作发生之后(self.flag && hasMoved == 1)，才会保存此次绘图之前的snapshot截屏
				if (self.flag && hasMoved) {
					self.imgArr.push(imgData);
					console.log("++++---- push ----++++")
					// console.log(self.imgArr.length);
					console.log(self.imgArr);
				}
				ctx.closePath();
				self.flag = false;
				hasMoved = false;
				self.bEraser = false;
			})

			cavs.mouseleave(function (e) {
				// 鼠标绘图超出画布而未mouseup，也算成功完成一次绘图动作，需要保存之前的snapshot截屏
				if (self.flag && hasMoved) {
					self.imgArr.push(imgData);
					console.log("++++---- push ----++++")
					console.log(self.imgArr)
				}
				ctx.closePath();
				self.flag = false;
				self.bEraser = false;
			})
		})
	},
	bindEvent : function () {
		var self = this;
		var ctx = this.ctx;
		$(".btn-list").on("click", function (e) {
			e = e || window.event;
			switch (e.target.id) {
				case "cleanBoard":
					ctx.clearRect(0, 0, self.cavs[0].width, self.cavs[0].height);
					break;
				case "eraser":
					// 橡皮功能使用设置“白色”样式变相实现，一次擦出动作完成需要恢复之前样式
					self.bEraser = true;
					self.curStyle = ctx.strokeStyle;
					ctx.strokeStyle = "#FFF";
					break;
				case "undo":
					if (self.imgArr.length > 0) {
						ctx.putImageData(self.imgArr.pop(), 0, 0);
						console.log("----++++ pop ++++----")
						console.log(self.imgArr);
					}
					break;
			}
		});

		this.color.change(function (e) {
			ctx.strokeStyle = $(this).val();
		});

		this.line.change(function (e) {
			ctx.lineWidth = $(this).val();
		});
	}
}

obj.init();
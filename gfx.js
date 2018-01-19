"use strict";
var gfx = (function(id) {
	this.screen = null;
	this.ctx = null;
	
	this.init = function(id) {
		this.screen = document.getElementById(id);
		this.ctx = this.screen.getContext("2d");
		this.ctx.fillStyle = "#FFF";
	};
	
	this.clear = function() {
		this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
	};
	
	this.drawPixel = function(x, y, white) {
		if(!white) return;
		this.ctx.fillRect(x * 10, y * 10, 10, 10);
	};
	
	this.feed = function(arr) {
		this.clear();
		for(var y = 0; y < 32; y++) {
			for(var x = 0; x < 64; x++) {
				this.drawPixel(x % 65, y % 33, arr[y * 64 + x] > 0);
			}
		}
	};
	
	this.init(id);
});

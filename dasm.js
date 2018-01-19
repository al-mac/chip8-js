"use strict";
var dasm = (function() {
	var getAsm = function(b) {
		var v0f00 = ((b & 0x0F00) >> 8).toString(16).toUpperCase();
		var v00f0 = ((b & 0x00F0) >> 4).toString(16).toUpperCase();
		var m0fff = (b & 0x0FFF);
		var m00ff = (b & 0x00FF);
		switch(b & 0xF000) {
			case 0x0000:
				switch(b & 0x000F) {
					case 0x0000: return "CLS";
					case 0x000E: return "RET";
					default: return "???" + b & 0x000F;
				}
				break;
			case 0x1000: return "JP		" + m0fff;
			case 0x2000: return "CALL	" + m0fff;
			case 0x3000: return "SE		V" + v0f00 + ", " + m00ff;
			case 0x4000: return "SNE	V" + v0f00 + ", " + m00ff;
			case 0x5000: return "SE		V" + v0f00 + ", V" + v00f0;
			case 0x6000: return "LD		V" + v0f00 + ", " + m00ff;
			case 0x7000: return "ADD	V" + v0f00 + ", " + m00ff;
			case 0x8000:
				switch(b & 0x000F)
				{
					case 0x0000: return "LD			V" + v0f00 + ", V" + v00f0;
					case 0x0001: return "OR			V" + v0f00 + ", V" + v00f0;
					case 0x0002: return "AND		V" + v0f00 + ", V" + v00f0;
					case 0x0003: return "XOR		V" + v0f00 + ", V" + v00f0;
					case 0x0004: return "ADD		V" + v0f00 + ", V" + v00f0;
					case 0x0005: return "SUB		V" + v0f00 + ", V" + v00f0;
					case 0x0006: return "SHR		V" + v0f00 + "{, V" + v00f0 + "}";
					case 0x0007: return "SUBN		V" + v0f00 + ", V" + v00f0;
					case 0x000E: return "SHL		V" + v0f00 + "{, V" + v00f0 + "}";
					default: return "???" + b & 0x000F;
				}
				break;
			case 0x9000: return "SNE		V" + v0f00 + ", V" + v00f0;
			case 0xA000: return "LD			I, " + m0fff;
			case 0xB000: return "JP			V0, " + m0fff;
			case 0xC000: return "RND 		V" + v0f00 + ", " + m00ff;
			case 0xD000: return "DRW 		V" + v0f00 + ", " + v00f0 + ", " + (b & 0x000F);
			case 0xE000:
			{
				switch(b & 0x00FF)
				{
					case 0x009E: return "SKP 	V" + v0f00;
					case 0x00A1: return "SKNP 	V" + v0f00;
					default: return "???" + b & 0x000F;
				}
				break;
			}
			case 0xF000:
			{
				switch(b & 0x00FF)
				{
					case 0x0007: return "LD 		V" + v0f00 + ", DT";
					case 0x000A: return "LD 		V" + v0f00 + ", K";
					case 0x0015: return "LD 		DT, V" + v0f00;
					case 0x0018: return "LD 		ST, V" + v0f00;
					case 0x001E: return "ADD		I, V" + v0f00;
					case 0x0029: return "LD			F, V" + v0f00;
					case 0x0033: return "LD			B, V" + v0f00;
					case 0x0055: return "LD			[I], V" + v0f00;
					case 0x0065: return "LD			V" + v0f00 + ", [I]";
					default: return "???" + b & 0x000F;
				}
				break;
			}
			default: return "???" + b & 0x000F;
		}
	};
	
	this.decode = function(rom) {
		var ret = { opcs: [], asms: [] };
		for(var i = 0; i < rom.length; i += 2) {
			var op = rom[i] << 8 | rom[i + 1];
			ret.opcs.push(op.toString(16));
			ret.asms.push(getAsm(op));
		}
		return ret;
	};
});

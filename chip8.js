"use strict";
var chip8 = (function() {
	this.draw = false;
	this.opcode = null;
	this.memory = new Uint8Array(4096);
	this.V = new Uint8Array(16);
	this.I = null;
	this.pc = null;
	this.gfx = new Array(2048);
	this.dly = null;
	this.snd = null;
	this.stack = new Array(16);
	this.sp = null;
	this.key = new Array(16);
	this.rom = [];
	this.paused = false;
	this.sound = false;
	
	var fontset =
	[
		0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
	];
	
	this.init = function() {
		this.pc = 0x200;
		this.opcode = this.I = this.snd = this.dly = this.sp = 0x00;
		this.memory = new Uint8Array(4096);
		this.gfx = new Array(2048);
		
		for(var i = 0; i < 80; i++)
			this.memory[i] = fontset[i];
			
		for(var i = 0; i < 16; i++) {
			this.stack[i] = 0x00;
			this.V[i] = 0x00;
			this.key[i] = 0x00;
		}
	};
	
	this.load = function(rom) {
		this.rom = rom;
		for(var i = 0; i < this.rom.length; i++)
			this.memory[i + 512] = this.rom[i];
	};
	
	this.cycle = function() {
		if(this.sound)
			this.sound = false;
			
		if(this.paused) {
			step(this);
		}
		else {
			for(var i = 0; i < 10; i++) {
				step(this);
			}
		}
	};
	
	var step = function (emu) {
		emu.opcode = emu.memory[emu.pc] << 8 | emu.memory[emu.pc + 1];
		switch(emu.opcode & 0xF000) {
			case 0x0000:
				switch(emu.opcode & 0x000F) {
					case 0x0000:
						for(var i = 0; i < 2048; i++)
							emu.gfx[i] = 0x00;
						emu.pc += 2;
						break;
					case 0x000E:
						emu.sp--;
						emu.pc = emu.stack[emu.sp];
						emu.pc += 2;
						break;
					default: 
						console.log("unknown opcode 0x0000: " + emu.opcode & 0x000F);
						break;
				}
				break;
			case 0x1000:
				emu.pc = emu.opcode & 0x0FFF;
				break;
			case 0x2000:
				emu.stack[emu.sp] = emu.pc;
				emu.sp++;
				emu.pc = emu.opcode & 0x0FFF;
				break;
			case 0x3000:
				if(emu.V[(emu.opcode & 0x0F00) >> 8] == (emu.opcode & 0x00FF))
					emu.pc += 2;
				emu.pc += 2;
				break;
			case 0x4000:
				if(emu.V[(emu.opcode & 0x0F00) >> 8] != (emu.opcode & 0x00FF))
					emu.pc += 2;
				emu.pc += 2;
				break;
			case 0x5000:
				if(emu.V[(emu.opcode & 0x0F00) >> 8] == emu.V[(emu.opcode & 0x00F0) >> 4])
					emu.pc += 2;
				emu.pc += 2;
				break;
			case 0x6000:
				emu.V[(emu.opcode & 0xF00) >> 8] = (emu.opcode & 0x00FF);
				emu.pc += 2;
				break;
			case 0x7000:
				emu.V[(emu.opcode & 0xF00) >> 8] += (emu.opcode & 0x00FF);
				emu.pc += 2;
				break;
			case 0x8000:
				switch(emu.opcode & 0x000F)
				{
					case 0x0000:
						emu.V[(emu.opcode & 0x0F00) >> 8] = emu.V[(emu.opcode & 0x00F0) >> 4];
						emu.pc += 2;
						break;
					case 0x0001:
						emu.V[(emu.opcode & 0x0F00) >> 8] |= emu.V[(emu.opcode & 0x00F0) >> 4];
						emu.pc += 2;
						break;
					case 0x0002:
						emu.V[(emu.opcode & 0x0F00) >> 8] &= emu.V[(emu.opcode & 0x00F0) >> 4];
						emu.pc += 2;
						break;
					case 0x0003:
						emu.V[(emu.opcode & 0x0F00) >> 8] ^= emu.V[(emu.opcode & 0x00F0) >> 4];
						emu.pc += 2;
						break;
					case 0x0004:
						emu.V[15] = emu.V[(emu.opcode & 0x00F0) >> 4] > (0xFF - emu.V[(emu.opcode & 0x0F00) >> 8])
						 ? 1 : 0;
						emu.V[(emu.opcode & 0x0F00) >> 8] += emu.V[(emu.opcode & 0x00F0) >> 4];
						emu.pc += 2;
						break;
					case 0x0005:
						emu.V[15] = emu.V[(emu.opcode & 0x00F0) >> 4] > (emu.V[(emu.opcode & 0x0F00) >> 8])
						 ? 0 : 1;
						emu.V[(emu.opcode & 0x0F00) >> 8] -= emu.V[(emu.opcode & 0x00F0) >> 4];
						emu.pc += 2;
						break;
					case 0x0006:
						emu.V[15] = emu.V[(emu.opcode & 0x0F00) >> 8] & 0x1;
						emu.V[(emu.opcode & 0x0F00) >> 8] >>= 1;
						emu.pc += 2;
						break;
					case 0x0007:
						emu.V[15] = emu.V[(emu.opcode & 0x0F00) >> 8] > emu.V[(emu.opcode & 0x00F0) >> 4]
						 ? 0 : 1;
						emu.V[(emu.opcode & 0x0F00) >> 8] = emu.V[(emu.opcode & 0x00F0) >> 4] - emu.V[(emu.opcode & 0x0F00) >> 8];
						emu.pc += 2;
						break;
					case 0x000E:
						emu.V[0xF] = emu.V[(emu.opcode & 0x0F00) >> 8] >> 7;
						emu.V[(emu.opcode & 0x0F00) >> 8] <<= 1;
						emu.pc += 2;
						break;
				}
				break;
			case 0x9000:
				if(emu.V[(emu.opcode & 0x0F00) >> 8] != emu.V[(emu.opcode & 0x00F0) >> 4])
					emu.pc += 2;
				emu.pc += 2;
				break;
			case 0xA000:
				emu.I = emu.opcode & 0x0FFF;
				emu.pc += 2;
				break;
			case 0xB000:
				emu.pc = emu.V[0] + (emu.opcode & 0x0FFF);
				break;
			case 0xC000:
				var rand = Math.floor(Math.random() * 0xFF)
				emu.V[(emu.opcode & 0x0F00) >> 8] = (rand & 0xFF) & (emu.opcode & 0x00FF);
				emu.pc += 2;
				break;
			case 0xD000:
			{
				var x = emu.V[(emu.opcode & 0x0F00) >> 8];
				var y = emu.V[(emu.opcode & 0x00F0) >> 4];
				var height = emu.opcode & 0x000F;
				var pixel;

				emu.V[0xF] = 0;
				for (var yline = 0; yline < height; yline++)
				{
					pixel = emu.memory[emu.I + yline];
					for(var xline = 0; xline < 8; xline++)
					{
						if((pixel & (0x80 >> xline)) != 0)
						{
							if(emu.gfx[(x + xline + ((y + yline) * 64))] == 1)
								emu.V[0xF] = 1;
							emu.gfx[x + xline + ((y + yline) * 64)] ^= 1;
						}
					}
				}
				
				emu.pc += 2;
				emu.draw = true;
				break;
			}
			case 0xE000:
			{
				switch(emu.opcode & 0x00FF)
				{
					case 0x009E:
						if(emu.key[emu.V[(emu.opcode & 0x0F00) >> 8]] != 0)
							emu.pc += 2;
						emu.pc += 2;
						break;
					case 0x00A1:
						if(emu.key[emu.V[(emu.opcode & 0x0F00) >> 8]] == 0)
							emu.pc += 2;
						emu.pc += 2;
						break;
					default:
						console.log("unknown opcode 0xE000: " + emu.opcode & 0x000F);
						break;
				}
				break;
			}
			case 0xF000:
			{
				switch(emu.opcode & 0x00FF)
				{
					case 0x0007:
						emu.V[(emu.opcode & 0x0F00) >> 8] = emu.dly;
						emu.pc += 2;
						break;
					case 0x000A:
					{
						var p = false;
						for(var i = 0; i < 16; i++) {
							if(emu.key[i] != 0) {
								emu.V[(emu.opcode & 0x0F00) >> 8] = emu.key[i];
								p = true;
							}
						}
						if(!p)
							return;
						emu.pc += 2;
						break;
					}
					case 0x0015:
						emu.dly = emu.V[(emu.opcode & 0x0F00) >> 8];
						emu.pc += 2;
						break;
					case 0x0018:
						emu.snd = emu.V[(emu.opcode & 0x0F00) >> 8];
						emu.pc += 2;
						break;
					case 0x001E:
						if((emu.I + emu.V[(emu.opcode & 0x0F00) >> 8]) > 0xFFF)
							emu.V[15] = 1;
						else 
							emu.V[15] = 0;
						emu.I += emu.V[(emu.opcode & 0x0F00) >> 8];
						emu.pc += 2;
						break;
					case 0x0029:
						emu.I = emu.V[(emu.opcode & 0x0F00) >> 8] * 0x5;
						emu.pc += 2;
						break;
					case 0x0033:
						emu.memory[emu.I] = (emu.V[(emu.opcode & 0x0F00) >> 8] / 100);
						emu.memory[emu.I + 1] = (emu.V[(emu.opcode & 0x0F00) >> 8] / 10) % 10;
						emu.memory[emu.I + 2] = (emu.V[(emu.opcode & 0x0F00) >> 8] % 100) % 10;
						emu.pc += 2;
						break;
					case 0x0055:
						for(var i = 0; i <= (emu.opcode & 0x0F00) >> 8; ++i) {
							emu.memory[emu.I + i] = emu.V[i];
						}
						emu.I += (emu.opcode & 0x0F00 >> 8) + 1;
						emu.pc += 2;
						break;
					case 0x0065:
						for(var i = 0; i <= (emu.opcode & 0x0F00) >> 8; ++i) {
							emu.V[i] = emu.memory[emu.I + i];
						}
						emu.I += (emu.opcode & 0x0F00 >> 8) + 1;
						emu.pc += 2;
						break;
					default:
						console.log("unknown opcode 0xF000: " + emu.opcode & 0x000F);
						break;
				}
				break;
			}
			default:
				console.log("unknown opcode: " + emu.opcode & 0x000F);
				break;
		}
		
		if(emu.dly > 0)
			--emu.dly;
		
		if(emu.snd > 0) {
			if(emu.snd == 1) {
				emu.sound = true;
			}
			--emu.snd;
		}
	};
});

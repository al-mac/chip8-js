var emu = null;
var grap = null;
var loop = null;
var beep = null;
var brix = [110,5,101,0,107,6,106,0,163,12,218,177,122,4,58,64,18,8,123,2,59,18,18,6,108,32,109,31,163,16,220,209,34,246,96,0,97,0,163,18,208,17,112,8,163,14,208,17,96,64,240,21,240,7,48,0,18,52,198,15,103,30,104,1,105,255,163,14,214,113,163,16,220,209,96,4,224,161,124,254,96,6,224,161,124,2,96,63,140,2,220,209,163,14,214,113,134,132,135,148,96,63,134,2,97,31,135,18,71,31,18,172,70,0,104,1,70,63,104,255,71,0,105,1,214,113,63,1,18,170,71,31,18,170,96,5,128,117,63,0,18,170,96,1,240,24,128,96,97,252,128,18,163,12,208,113,96,254,137,3,34,246,117,1,34,246,69,96,18,222,18,70,105,255,128,96,128,197,63,1,18,202,97,2,128,21,63,1,18,224,128,21,63,1,18,238,128,21,63,1,18,232,96,32,240,24,163,14,126,255,128,224,128,4,97,0,208,17,62,0,18,48,18,222,120,255,72,254,104,255,18,238,120,1,72,2,104,1,96,4,240,24,105,255,18,112,163,20,245,51,242,101,241,41,99,55,100,0,211,69,115,5,242,41,211,69,0,238,224,0,128,0,252,0,170,0,0,0,0,0];

var assembly = {
	opc: document.getElementById("opc"),
	asm: document.getElementById("asm"),
	
	init: function(rom) {
		assembly.asm.innerHTML = assembly.opc.innerHTML = "";
		var d = new dasm();
		var code = d.decode(rom);
		for(var i = 0; i < code.opcs.length; i++) {
			var o = document.createElement("div");
			o.className = "line";
			o.innerHTML = "0x" + code.opcs[i].toUpperCase();
			opc.appendChild(o);
			
			var a = document.createElement("div");
			a.className = "line";
			a.innerHTML = code.asms[i];
			asm.appendChild(a);
		};
	},
	
	update: function() {
		for(var i = 0; i < assembly.opc.children.length; i++) {
			if(i == (emu.pc / 2) - 256) {
				assembly.opc.children[i].className = "line highlighted";
				assembly.asm.children[i].className = "line highlighted";
				assembly.opc.children[(i + 8) > assembly.opc.children.length - 1 ? i : i + 8].scrollIntoView(false);
				assembly.asm.children[(i + 8) > assembly.opc.children.length - 1 ? i : i + 8].scrollIntoView(false);
			}
			else {
				assembly.opc.children[i].className = "line";
				assembly.asm.children[i].className = "line";
			}
		}
	}
};

var stack = {
	update: function() {
		for(var i = 0; i < 16; i++) {
			var st = document.getElementById("stack" + i);
			st.className = emu.sp == i ? "line highlighted" : "line";
			st.innerHTML = emu.stack[i] == undefined ? 0 : emu.stack[i];
		}
	}
};

var registers = {	
	update: function() {
		for(var i = 0; i < 16; i++) {
			var v = document.getElementById("v" + i);
			v.className = v.innerHTML != emu.V[i] ? "cell highlighted" : "cell";
			v.innerHTML = emu.V[i] == undefined ? 0 : emu.V[i];
		}
	}
};

var keys = {
	update: function() {
		for(var i = 0; i < 16; i++) {
			var k = document.getElementById("k" + i);
			k.className = emu.key[i] == 1 ? "cell highlighted" : "cell";
			k.innerHTML = emu.key[i] == undefined ? 0 : emu.key[i];
		}
	}
};

var flags = {
	update: function() {
		document.getElementById("fI").className = document.getElementById("fI").innerHTML != emu.I ? "cell highlighted" : "cell";
		document.getElementById("fpc").className = document.getElementById("fpc").innerHTML != emu.pc ? "cell highlighted" : "cell";
		document.getElementById("fsnd").className = document.getElementById("fsnd").innerHTML != emu.snd ? "cell highlighted" : "cell";
		document.getElementById("fdly").className = document.getElementById("fdly").innerHTML != emu.dly ? "cell highlighted" : "cell";
		document.getElementById("fsp").className = document.getElementById("fsp").innerHTML != emu.sp ? "cell highlighted" : "cell";
			
		
		document.getElementById("fI").innerHTML = emu.I;
		document.getElementById("fpc").innerHTML = emu.pc;
		document.getElementById("fsnd").innerHTML = emu.snd;
		document.getElementById("fdly").innerHTML = emu.dly;
		document.getElementById("fsp").innerHTML = emu.sp;
	}
};

function setup(rom) {
	grap = new gfx("game-screen");
	emu = new chip8();
	emu.init();
	emu.load(rom);
	assembly.init(rom);
	main.init();
	if(loop != null)
		clearInterval(loop);
	loop = setInterval(function() {
		if(!emu.paused || (emu.paused && main.step)) {
			emu.cycle();
			main.update();
			
			if(emu.sound) {
				beep.play();
			}
			
			if(emu.draw) {
				grap.feed(emu.gfx);
				emu.draw = false;
				if((new Date() - main.date) < 1000)
					main.fps++;
				else {
					main.date = new Date();
					document.getElementById("fps-counter").innerHTML = "FPS: " + main.fps;
					main.fps = 0;
				}
			}
			
			main.step = false;
		}
	}, 16);
}

var main = {
	step: false,
	fps: 0,
	date: new Date(),
	
	init: function() {
		document.getElementById("rom-file").addEventListener("change", main.handleFile, false);
		document.onkeydown = function(e) {
			console.log(e.keyCode);
			switch(e.keyCode) {
				case 49: emu.key[0x1] = 1; break;
				case 50: emu.key[0x2] = 1; break;
				case 51: emu.key[0x3] = 1; break;
				case 52: emu.key[0xC] = 1; break;

				case 81: emu.key[0x4] = 1; break;
				case 87: emu.key[0x5] = 1; break;
				case 69: emu.key[0x6] = 1; break;
				case 82: emu.key[0xD] = 1; break;

				case 65: emu.key[0x7] = 1; break;
				case 83: emu.key[0x8] = 1; break;
				case 68: emu.key[0x9] = 1; break;
				case 70: emu.key[0xE] = 1; break;

				case 90: emu.key[0xA] = 1; break;
				case 88: emu.key[0x0] = 1; break;
				case 67: emu.key[0xB] = 1; break;
				case 86: emu.key[0xF] = 1; break;

				// debugging keys;
				case 80: emu.paused = !emu.paused; break;
				case 79: main.step = true; break;
				case 75: setup(emu.rom); break;
				case 76: document.getElementById("rom-file").click(); break;
			}
		};

		document.onkeyup = function(e) {
			switch(e.keyCode) {
				case 49: emu.key[0x1] = 0; break;
				case 50: emu.key[0x2] = 0; break;
				case 51: emu.key[0x3] = 0; break;
				case 52: emu.key[0xC] = 0; break;

				case 81: emu.key[0x4] = 0; break;
				case 87: emu.key[0x5] = 0; break;
				case 69: emu.key[0x6] = 0; break;
				case 82: emu.key[0xD] = 0; break;

				case 65: emu.key[0x7] = 0; break;
				case 83: emu.key[0x8] = 0; break;
				case 68: emu.key[0x9] = 0; break;
				case 70: emu.key[0xE] = 0; break;

				case 90: emu.key[0xA] = 0; break;
				case 88: emu.key[0x0] = 0; break;
				case 67: emu.key[0xB] = 0; break;
				case 86: emu.key[0xF] = 0; break;
			}
		};
		
		beep = new Audio('beep.wav');
	},
	
	handleFile: function(e) {
		if(e.target.files.length == 0) return;
		var file = e.target.files[0];
		var r = new FileReader();
		r.onload = function() {
			var array = new Int8Array(r.result);
			var array2 = [];
			for(var i = 0; i < array.length; i++) {
				array2.push(array[i] & 0xFF);
			}
			
			setup(array2);
			
		};
		r.readAsArrayBuffer(file);
	},
	
	update: function() {
		assembly.update();
		stack.update();
		registers.update();
		keys.update();
		flags.update();
	}
};

setup(brix);

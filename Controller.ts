const { ipcMain, BrowserWindow } = require("electron");
const { EventEmitter } = require("stream");

function generateRandom(length=32)
{
	var s = "";
	for (var i = 0; i < 32; i++)
	{
		s += "0123456789ABCDEF"[Math.floor(Math.random()*16)]
	}
	return s;
}

class ControllerEngine extends EventEmitter
{
	#seed = generateRandom();

	electron = {
		window : new BrowserWindow({
			show : false,
			titleBarStyle : "hidden",
			skipTaskbar : true,
			title : `Controller Engine - Personal Console - Instance(${this.#seed})`,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false
			}
		})
	};

	#initialised = false;
	constructor ()
	{
		super();
		this.seed = (() => {var s = ""; for (var i = 0; i < 32; i++) {s += "0123456789ABCDEF"[Math.floor(Math.random()*16)]} return s;})();

		ipcMain.on(`controllerEngine`, (event, arg) => {
			switch (arg.code) {
				case 'engine-start':
					if (this.#initialised)
						this.emit('restarted')
					else
						this.emit('ready');
					this.#initialised = true;
					break;
				case 'ctrl-connected':
					var addedController = new Controller(arg.controllerindex, this, arg.channel);
					this.emit('controller', addedController);
					break;
				default:
					this.emit('err', {
						code: `NullCapture`,
						message:`code '${arg.code}' was thrown from 'controllerEngine' channel without a capture.`,
						type: 'internal'
					});
					break;
			}
		});

		this.electron.window.loadFile("ControllerEngine/engine.html");
		this.electron.window.on('unresponsive', () => {
			this.emit('crashed')
			this.electron.window.reload();
		});
		this.electron.window.on('close', (e) => {
			this.electron.window.hide();
			e.preventDefault();
		});
	}

	openConsole()
	{
		this.electron.window.show();
	}

	closeConsole()
	{
		this.electron.window.hide();
	}
}

function buttonName(string)
{
	switch (string)
	{
		case "LEFT_ANALOG_STICK":
			return "LeftStick";
		case "RIGHT_ANALOG_STICK":
			return "RightStick";
		case "LEFT_SHOULDER_BOTTOM":
			return "L2";
		case "RIGHT_SHOULDER_BOTTOM":
			return "R2";
		case "LEFT_SHOULDER":
			return "L1";
		case "RIGHT_SHOULDER":
			return "R1";
		case "LEFT_ANALOG_BUTTON":
			return "L3";
		case "RIGHT_ANALOG_BUTTON":
			return "R3";
		case "START":
			return "Start";
		case "SELECT":
			return "Select";
		case "HOME":
			return "Home";
		case "FACE_1":
			return "A";
		case "FACE_2":
			return "B";
		case "FACE_3":
			return "X";
		case "FACE_4":
			return "Y";
		case "DPAD_UP":
			return "PadUp";
		case "DPAD_DOWN":
			return "PadDown";
		case "DPAD_LEFT":
			return "PadLeft";
		case "DPAD_RIGHT":
			return "PadRight";
		default:
			console.log(string);
			return string;
	}
}

class Controller extends EventEmitter
{
	index = 0;
	player = this.index+1;
	linked = false;

	#listener;
	#channel;
	#parent;

	constructor (index=0, parent, channel="")
	{
		super();
		this.#parent = parent;
		if (channel != "")
			this.#connect(channel);
		this.index = index;
		this.player = this.index + 1;
	}

	#connect(channel)
	{
		if (!channel)
			return false;
		this.#channel = channel;
		if (this.linked)
			this.disconnect();
		
		this.#listener = (e, d) => {
			switch(d.code)
			{
				case 'disconnected':
					this.disconnect();
					break;
				case 'buttonDown':
					this.emit(buttonName(d.button));
					break;
				case 'buttonUp':
					this.emit(`${buttonName(d.button)}-up`);
					break;
				case 'analogChange':
					this.emit(`axis-${buttonName(d.axis)}`, d.value);
					break;
				default:
					this.emit('err', {
						code: `NullCapture`,
						message:`code '${d.code}' was thrown from 'Controller-CH<uuid>' channel without a capture.`,
						type: 'internal'
					});
			}
		};
		
		ipcMain.on(`Controller-CH${this.#channel}`, this.#listener);
		this.linked = true;
	}

	disconnect()
	{
		if (this.linked)
		{
			this.linked = false;
			ipcMain.off(`Controller-CH${this.#channel}`, this.#listener);
			this.emit('disconnected');
		}
	}

	haptic = {
		vibrate: (strength=0.1, duration=1000) =>
		{
			this.#parent.electron.window.webContents.send(`Controller-CH${this.#channel}`, {
				code: "vibrate-custom"
			});
		},
		pulse: () =>
		{
			this.#parent.electron.window.webContents.send(`Controller-CH${this.#channel}`, {
				code: "vibrate-pulse"
			});
		},
		tick: () => {
			this.#parent.electron.window.webContents.send(`Controller-CH${this.#channel}`, {
				code: "vibrate-tick"
			});
		}
	};

	
};

module.exports = {
	ControllerEngine,
	Controller
};
const { ipcMain, BrowserWindow } = require("electron");
const { EventEmitter } = require("stream");

class ConsoleApplet extends EventEmitter
{
	electron = {
		window : new BrowserWindow({
			show : false,
			titleBarStyle : "hidden",
			title : `Personal Console`,
			fullscreen : true,
			kiosk : true,
			transparent : true,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false
			}
		})
	};

	constructor ()
	{
		super();
		this.electron.window.loadFile("Interface/index.html");

		this.emit('ready');
	}
	
	show()
	{
		this.electron.window.show();
	}

	hide()
	{
		this.electron.window.hide();
	}
}

module.exports = {
	ConsoleApplet
};
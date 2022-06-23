const { ipcMain, BrowserWindow } = require("electron");
const { EventEmitter } = require("stream");

class ConsoleApplet
{
	electron = {};

	constructor ()
	{
		this.electron = {
			window : new BrowserWindow({
				show : false,
				titleBarStyle : "hidden",
				skipTaskbar : false,
				title : `Personal Console`,
				webPreferences: {
					nodeIntegration: true,
					contextIsolation: false
				}
			})
		};
	}
	
	show()
	{

	}

	hide()
	{

	}
}

module.exports = {
	ConsoleApplet
};
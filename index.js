const {Logger} = require("./debug.ts");
const {app, BrowserWindow, ipcMain} = require("electron");
const {ControllerEngine, Controller} = require("./Controller.ts");
const {ConsoleApplet} = require("./Console.ts");


app.on('ready', () => {
	const applet = new ConsoleApplet();
	const ce = new ControllerEngine();
	ce.once('ready', () => {
		console.clear();
		Logger.Info("Controller Engine started.");
	});

	ce.on('controller', (controller) => {
		Logger.Info(`Controller ${controller.player} connected.`);
		controller.haptic.tick();

		controller.on('Home', () => {
			
		})

		controller.on(`err`, (err) => {Logger.Error(`PersonalConsole.Engine.Controller.${err.code}: ${err.message}`)});
	});

	ce.on('err', (err) => {Logger.Error(`PersonalConsole.Engine.${err.code}: ${err.message}`)});
});
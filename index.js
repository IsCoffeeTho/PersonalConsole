const {Logger} = require("./debug.ts");
const {app, BrowserWindow, ipcMain} = require("electron");
const {ControllerEngine, Controller} = require("./Controller.ts");
const {ConsoleApplet} = require("./Console.ts");


app.on('ready', () => {
	const applet = new ConsoleApplet();
	const engine = new ControllerEngine();
	engine.once('ready', () => {
		console.clear();
		Logger.Info("Controller Engine started.");

		engine.on('controller', (controller) => {
			controller.haptic.tick();
		});
	});

	applet.on('ready', () => {
		applet.show();
	});

	engine.on('err', (err) => {Logger.Error(`PersonalConsole.Engine.${err.code}: ${err.message}`)});

	applet.on('err', (err) => {Logger.Error(`PersonalConsole.Applet.${err.code}: ${err.message}`)})
});
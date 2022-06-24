const { ipcRenderer } = require("electron");

var controllers = [];

var lsh = [];
var rsh = [];

function generateRandom(length = 32) {
	var s = "";
	for (var i = 0; i < length; i++) {
		s += "0123456789ABCDEF"[Math.floor(Math.random() * 16)]
	}
	return s;
}

function init() {
	if (Controller.supported) {
		Controller.search();
		window.addEventListener('gc.controller.found', (event) => {
			var controller = event.detail.controller;
			if (!controllers[controller.index])
				controllers[controller.index] = generateRandom();
			ipcRenderer.send('controllerEngine', {
				code: "ctrl-connected",
				controllerindex: event.detail.index,
				channel: controllers[controller.index]
			});

			ipcRenderer.on(`Controller-CH${controllers[controller.index]}`, (e, d) => {
				switch (d.code)
				{
					case "vibrate-custom":
						navigator.getGamepads()[controller.index].vibrationActuator.playEffect('dual-rumble', {
							startDelay : 0,
							weakMagnitude: d.strength,
							strongMagnitude: d.strength,
							duration: d.duration
						});
						break;
					case "vibrate-pulse":
						navigator.getGamepads()[controller.index].vibrationActuator.playEffect('dual-rumble', {
							startDelay : 0,
							weakMagnitude: 0.5,
							strongMagnitude: 0.1,
							duration: 200
						});
						break;
					case "vibrate-tick":
						navigator.getGamepads()[controller.index].vibrationActuator.playEffect('dual-rumble', {
							startDelay : 0,
							weakMagnitude: 1,
							strongMagnitude: 1,
							duration: 70
						});
						break;
				}
			})
			Logger.Info(`Controller ${controller.index} connected (${controllers[controller.index]}).`);
		});

		window.addEventListener('gc.controller.lost', (event) => {
			var controller = event.detail;
			ipcRenderer.send(`Controller-CH${controllers[controller.index]}`, {
				code: "disconnected"
			});
			Logger.Info(`Controller ${controller.index} disconnected.`);
			delete controllers[controller.index];
		});

		window.addEventListener('gc.button.press', (event) => {
			event = event.detail;
			ipcRenderer.send(`Controller-CH${controllers[event.controllerIndex]}`, {
				code: `buttonDown`,
				button: event.name
			});
		});

		window.addEventListener('gc.button.release', (event) => {
			event = event.detail;
			ipcRenderer.send(`Controller-CH${controllers[event.controllerIndex]}`, {
				code: `buttonUp`,
				button: event.name
			});
		});

		window.addEventListener('gc.button.hold', (event) => {
			event = event.detail;
			if (event.name == "LEFT_SHOULDER_BOTTOM" && event.value != lsh[event.controllerIndex])
			{
				ipcRenderer.send(`Controller-CH${controllers[event.controllerIndex]}`, {
					code: `analogChange`,
					axis: event.name,
					value: event.value
				});
				lsh[event.controllerIndex] = event.value;
			}
			if (event.name == "RIGHT_SHOULDER_BOTTOM" && event.value != rsh[event.controllerIndex])
			{
				ipcRenderer.send(`Controller-CH${controllers[event.controllerIndex]}`, {
					code: `analogChange`,
					axis: event.name,
					value: event.value
				});
				rsh[event.controllerIndex] = event.value;
			}
		});

		window.addEventListener('gc.analog.change', (event) => {
			event = event.detail;
			ipcRenderer.send(`Controller-CH${controllers[event.controllerIndex]}`, {
				code: `analogChange`,
				axis: event.name,
				value: event.position
			});
		});

		Logger.Info("Engine Started.");
		ipcRenderer.send('controllerEngine', {
			code: "engine-start"
		});
	}
	else {
		Logger.Error(`Controllers aren't supported on this browser.`);
		ipcRenderer.send('controllerEngine', {
			code: "err-notsupported",
			msg: "Controllers aren't supported on this browser"
		});
	}
}


window.onload = init;

window.onkeydown = (e) => {
	e.preventDefault();
};
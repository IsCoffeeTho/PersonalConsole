const {exit} = require("process");

class Logger
{
	static esc = String.fromCharCode(27);

	static Fatal(error)
	{
		
		console.error(`[FATAL]${(typeof error == "string" ? `${Logger.esc}[91m` : "")}`, error, `${Logger.esc}[0m`);
		exit(1);
	}

	static Error(error)
	{
		console.error(`[Error]${(typeof error == "string" ? `${Logger.esc}[91m` : "")}`, error, `${Logger.esc}[0m`);
	}

	static Info(message)
	{
		console.info(`[Info]${(typeof message == "string" ? `${Logger.esc}[94m` : "")}`, message, `${Logger.esc}[0m`);
	}

	static Trace(error)
	{
		console.trace(`[Error]${(typeof error == "string" ? `${Logger.esc}[91m` : "")}`, error, `${Logger.esc}[0m`);
	}
};

module.exports = {
	Logger
}
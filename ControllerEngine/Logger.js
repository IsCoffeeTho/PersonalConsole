class Logger
{
	static Info(message)
	{
		console.log(`[Info] ${message}`);
		Logger._print(`[Info] ${message}`);
	}

	static Trace(message)
	{
		console.Error(`[Error] ${message}`);
		Logger._print(`[Error] ${message}`);
	}
	
	static Trace(message)
	{
		var err = new Error(message);
		console.log(`[Error] ${err.stack.substring(7)}`);
		Logger._print(`[Error] ${err.stack.substring(7)}`);

	}

	static _print(message)
	{
		var msg = document.createElement("pre");
		msg.append(message);
		document.getElementsByTagName("body")[0].append(msg);
	}
}

module.exports = {
	Logger
};
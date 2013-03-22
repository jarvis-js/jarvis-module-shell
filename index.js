/*global module*/

var readline = require('readline');

module.exports = function(jarvis, module) {
    new ShellAdapter(jarvis, module);
};

function ShellAdapter(jarvis, module) {
	var self = this;
	this.jarvis = jarvis;

	var stdin = process.openStdin();
	var stdout = process.stdout;

	this.repl = readline.createInterface(stdin, stdout, null);

	var channelName = module.name + ':' + module.name;

	this.channel = jarvis.createChannel(channelName);

	this.channel.say = function(message, response) {
		self.repl.write(response + '\n');
		self.repl.prompt();
	};

	this.repl.on('close', function() {
		stdin.destroy();
		process.exit(0);
	});

	this.repl.on('line', function(buffer) {
		if (buffer.toLowerCase() === 'exit') {
			self.repl.close();
		}

		self.channel.received(new self.channel.Message({
			body: buffer,
			channel: channelName,
			user: {
				name: 'admin',
				identifier: 'shell:admin'
			}
		}));

		self.repl.prompt();
	});

	this.repl.on('SIGINT', function() {
		process.emit('SIGINT');
	});

	this.repl.setPrompt(module.options.prompt || '> ');
	this.repl.prompt();
}

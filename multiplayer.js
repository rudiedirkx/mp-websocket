var websocket = require('websocket'),
	rwebsocket = require('./rwebsocket.js');



function _log(msg) {
	console.log.apply(console, arguments);
	console.log('');
}



// `this` is a WebSocketConnection, which has a `wsServer`, which has a `connections`
var commands = {
	// eval: function(msg) {
	// 	eval(msg.code);
	// },

	_open: function() {
		var x = Math.random() * 100,
			y = Math.random() * 100,
			coords = [x, y],
			color = '#' + Math.random().toString(16).substr(-6);

		this.data.coords = coords;
		this.data.color = color;

		var msg = {
			id: this.data.id,
			coords: coords,
			color: color,
		};

		var others = [];

		// Notify all other clients about this new client
		this.withAllOtherClients(function(client) {
			client.sendCmd('party', msg);

			others.push({
				id: client.data.id,
				coords: client.data.coords,
				color: client.data.color,
			});
		});

		// Notify the client about hisself and all other clients
		msg.others = others;
		this.sendCmd('join', msg);
	},
	_close: function() {
		this.withAllOtherClients(function(other) {
			other.sendCmd('unparty', {id: this.data.id});
		});
	},

	move: function(msg) {
		this.data.coords[0] = msg.coords[0];
		this.data.coords[1] = msg.coords[1];

		msg.id = this.data.id;
		this.withAllOtherClients(function(other) {
			other.sendCmd('partymove', msg);
		});
	}
};



var options = {
	port: 8084,
	commands: commands,
}
var rws = rwebsocket(options, websocket);
var wsServer = rws.wsServer;

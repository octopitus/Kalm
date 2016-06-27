

'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dgram = require('dgram');

var Adapter = require('./common');

var _socketType = 'udp4';
var _startByte = 0;
var _keySeparator = ':';
var _localAddress = '0.0.0.0';

var UDP = function (_Adapter) {
	(0, _inherits3.default)(UDP, _Adapter);

	function UDP() {
		(0, _classCallCheck3.default)(this, UDP);
		return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(UDP).call(this, 'udp'));
	}

	(0, _createClass3.default)(UDP, [{
		key: '_handleNewSocket',
		value: function _handleNewSocket(server, data, origin) {
			var key = [origin.address, _keySeparator, origin.port].join();

			if (!server.__clients) server.__clients = {};
			if (!(key in server.__clients)) {
				server.__clients[key] = server.createClient({
					hostname: origin.address,
					port: origin.port,
					adapter: this.type,
					encoder: server.options.encoder
				});
			}

			server.__clients[key].handleRequest(data);
		}
	}, {
		key: 'listen',
		value: function listen(server, callback) {
			var _this2 = this;

			server.listener = dgram.createSocket({
				type: _socketType,
				reuseAddr: true
			});
			server.listener.on('message', function (data, origin) {
				_this2._handleNewSocket(server, data, origin);
			});
			server.listener.on('error', server.handleError.bind(server));
			server.listener.bind(server.options.port, _localAddress);

			return callback();
		}
	}, {
		key: 'send',
		value: function send(socket, payload) {
			if (socket) {
				socket.send(payload, _startByte, payload.length, socket.__port, socket.__hostname);
			}
		}
	}, {
		key: 'stop',
		value: function stop(server, callback) {
			for (var client in server.__clients) {
				if (server.__clients.hasOwnProperty(client)) {
					this.disconnect(server.__clients[client]);
				}
			}
			server.listener.close();
			process.nextTick(callback);
		}
	}, {
		key: 'createSocket',
		value: function createSocket(client, soc) {
			if (soc) return soc;

			var socket = dgram.createSocket(_socketType);
			socket.__port = client.options.port;
			socket.__hostname = client.options.hostname;

			socket.on('error', client.handleError.bind(client));

			socket.bind(null, _localAddress);

			socket.on('message', client.handleRequest.bind(client));

			process.nextTick(client.handleConnect.bind(client));

			return socket;
		}
	}, {
		key: 'disconnect',
		value: function disconnect(client) {
			process.nextTick(client.handleDisconnect.bind(client));
		}
	}]);
	return UDP;
}(Adapter);

module.exports = new UDP();
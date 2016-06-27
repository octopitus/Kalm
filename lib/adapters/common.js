

'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SEP = new Buffer('\n');

var Adapter = function () {
	function Adapter(type) {
		(0, _classCallCheck3.default)(this, Adapter);

		this.type = type;
	}

	(0, _createClass3.default)(Adapter, [{
		key: 'listen',
		value: function listen() {
			throw new Error('not implemented');
		}
	}, {
		key: 'stop',
		value: function stop(server, callback) {
			server.listener.close(function () {
				process.nextTick(callback);
			});
		}
	}, {
		key: 'send',
		value: function send(socket, payload) {
			if (socket) {
				socket.write(payload);
				socket.write(SEP);
			}
		}
	}, {
		key: 'createSocket',
		value: function createSocket() {
			throw new Error('not implemented');
		}
	}, {
		key: 'disconnect',
		value: function disconnect(client) {
			if (client.socket && client.socket.destroy) {
				client.socket.destroy();
				process.nextTick(client.handleDisconnect.bind(client));
			}
		}
	}]);
	return Adapter;
}();

module.exports = Adapter;
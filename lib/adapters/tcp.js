

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

var net = require('net');
var split = require('binary-split');

var Adapter = require('./common');

var TCP = function (_Adapter) {
	(0, _inherits3.default)(TCP, _Adapter);

	function TCP() {
		(0, _classCallCheck3.default)(this, TCP);
		return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TCP).call(this, 'tcp'));
	}

	(0, _createClass3.default)(TCP, [{
		key: 'listen',
		value: function listen(server, callback) {
			server.listener = net.createServer(server.handleRequest.bind(server));
			server.listener.listen(server.options.port, callback);
			server.listener.on('error', server.handleError.bind(server));
		}
	}, {
		key: 'createSocket',
		value: function createSocket(client, socket) {
			var _this2 = this;

			if (!socket) {
				socket = net.connect(client.options.port, client.options.hostname);
			}

			var stream = socket.pipe(split());
			stream.on('data', client.handleRequest.bind(client));

			socket.on('error', client.handleError.bind(client));

			socket.on('connect', client.handleConnect.bind(client));

			socket.on('close', client.handleDisconnect.bind(client));

			socket.on('timeout', function () {
				return _this2.disconnect(client);
			});

			socket.setTimeout(client.options.socketTimeout);

			return socket;
		}
	}]);
	return TCP;
}(Adapter);

module.exports = new TCP();
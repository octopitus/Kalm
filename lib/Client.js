

'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');

var debug = require('debug')('kalm');
var statsOut = require('debug')('kalm:stats');

var defaults = require('./defaults');
var adapters = require('./adapters');
var encoders = require('./encoders');

var Channel = require('./Channel');

var Client = function (_EventEmitter) {
	(0, _inherits3.default)(Client, _EventEmitter);

	function Client() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var socket = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
		(0, _classCallCheck3.default)(this, Client);

		var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Client).call(this));

		_this.id = crypto.randomBytes(20).toString('hex');

		_this.options = {
			hostname: options.hostname || defaults.hostname,
			port: options.port || defaults.port,

			adapter: options.adapter || defaults.adapter,

			encoder: options.encoder || defaults.encoder,

			bundler: (0, _assign2.default)({}, defaults.bundler, options.bundler || {}),

			stats: options.stats || defaults.stats,

			socketTimeout: options.socketTimeout || defaults.socketTimeout,

			rejectForeign: options.rejectForeign || defaults.rejectForeign
		};

		_this.channels = {};

		_this.fromServer = options.tick !== undefined;

		_this.tick = options.tick || null;

		if (options.channels) {
			(0, _keys2.default)(options.channels).forEach(function (c) {
				_this.subscribe(c, options.channels[c]);
			});
		}

		_this.socket = null;
		_this.use(socket);
		return _this;
	}

	(0, _createClass3.default)(Client, [{
		key: 'subscribe',
		value: function subscribe(name, handler) {
			var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			name = name + '';

			if (!this.channels.hasOwnProperty(name)) {
				debug('log: new ' + (this.fromServer ? 'server' : 'client') + ' connection ' + this.options.adapter + '://' + this.options.hostname + ':' + this.options.port + '/' + name);
				this.channels[name] = new Channel(name, (0, _assign2.default)({}, this.options.bundler, options), this);
			}

			if (handler) {
				this.channels[name].addHandler(handler);
			}

			return this;
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(name, handler) {
			name = name + '';

			if (!this.channels.hasOwnProperty(name)) return this;

			this.channels[name].removeHandler(handler);
			return this;
		}
	}, {
		key: 'use',
		value: function use(socket) {
			if (this.socket) {
				this.destroy();
			}

			this.socket = this.createSocket(socket);
			return this;
		}
	}, {
		key: 'handleError',
		value: function handleError(err) {
			debug('error: ' + err.message);
			debug(err.stack);
			this.emit('error', err);
		}
	}, {
		key: 'handleConnect',
		value: function handleConnect(socket) {
			debug('log: ' + (this.fromServer ? 'server' : 'client') + ' connection established');
			this.emit('connect', socket);
			this.emit('connection', socket);

			for (var channel in this.channels) {
				if (this.channels[channel].packets.length) {
					this.channels[channel].startBundler();
				}
			}
		}
	}, {
		key: 'handleDisconnect',
		value: function handleDisconnect() {
			debug('warn: ' + (this.fromServer ? 'server' : 'client') + ' connection lost');
			this.emit('disconnect');
			this.emit('disconnection');
			this.socket = null;
		}
	}, {
		key: 'send',
		value: function send(name, payload, once) {
			this.subscribe(name);

			this.channels[name].send(payload, once);
			return this;
		}
	}, {
		key: 'sendOnce',
		value: function sendOnce(name, payload) {
			this.send(name, payload, true);
			return this;
		}
	}, {
		key: 'sendNow',
		value: function sendNow(name, payload) {
			this.subscribe(name);

			this._emit(name, [payload]);
			return this;
		}
	}, {
		key: 'createSocket',
		value: function createSocket(socket) {
			return adapters.resolve(this.options.adapter).createSocket(this, socket);
		}
	}, {
		key: '_emit',
		value: function _emit(channel, packets) {
			var _this2 = this;

			_promise2.default.resolve().then(function () {
				return encoders.resolve(_this2.options.encoder).encode([channel, packets]);
			}).then(function (payload) {
				_promise2.default.resolve().then(function () {
					adapters.resolve(_this2.options.adapter).send(_this2.socket, payload);
				}).then(null, _this2.handleError);

				if (_this2.options.stats) {
					statsOut((0, _stringify2.default)({
						packets: packets.length,
						bytes: payload.length
					}));
				}
			}, this.handleError);
		}
	}, {
		key: 'handleRequest',
		value: function handleRequest(evt) {
			var _this3 = this;

			if (evt.length === 0) return;

			_promise2.default.resolve().then(function () {
				return encoders.resolve(_this3.options.encoder).decode(evt);
			}).then(function (raw) {
				if (raw && raw.length) {
					if (_this3.channels.hasOwnProperty(raw[0])) {
						_this3.channels[raw[0]].handleData(raw[1]);
						return;
					}
				}

				if (_this3.fromServer && _this3.options.rejectForeign) {
					_this3.handleError('malformed payload:' + evt);
					_this3.destroy();
				}
			}, function (err) {
				_this3.handleError(err);
				_this3.destroy();
			});
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			var _this4 = this;

			_promise2.default.resolve().then(function () {
				adapters.resolve(_this4.options.adapter).disconnect(_this4);
				_this4.socket = null;
			}).then(null, this.handleError);

			for (var channel in this.channels) {
				if (this.channels.hasOwnProperty(channel)) {
					this.channels[channel].resetBundler();
				}
			}
		}
	}]);
	return Client;
}(EventEmitter);

module.exports = Client;


'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var defaults = require('./defaults');
var Client = require('./Client');
var Timer = require('./Timer');
var adapters = require('./adapters');

var Server = function (_EventEmitter) {
	(0, _inherits3.default)(Server, _EventEmitter);

	function Server() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		(0, _classCallCheck3.default)(this, Server);

		var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Server).call(this));

		_this.id = crypto.randomBytes(20).toString('hex');

		_this.listener = null;
		_this._timer = null;

		_this.options = {
			adapter: options.adapter || defaults.adapter,
			encoder: options.encoder || defaults.encoder,
			port: options.port || defaults.port,
			tick: options.tick || defaults.tick,
			socketTimeout: options.socketTimeout || defaults.socketTimeout,
			rejectForeign: options.rejectForeign || defaults.rejectForeign
		};

		_this.connections = [];
		_this.channels = {};

		if (options.channels) {
			(0, _keys2.default)(options.channels).forEach(function (c) {
				_this.subscribe(c, options.channels[c]);
			});
		}

		_this.listen();
		_this.setTick(_this.options.tick);
		return _this;
	}

	(0, _createClass3.default)(Server, [{
		key: 'listen',
		value: function listen() {
			var _this2 = this;

			debug('log: listening ' + this.options.adapter + '://0.0.0.0:' + this.options.port);

			_promise2.default.resolve().then(function () {
				adapters.resolve(_this2.options.adapter).listen(_this2, function () {
					process.nextTick(function () {
						_this2.emit('ready');
					});
				});
			}).then(null, this.handleError);
		}
	}, {
		key: 'setTick',
		value: function setTick(delay) {
			this.options.tick = delay;

			if (this._timer) {
				this._timer.stop();
				this._timer = null;
			}

			if (delay) this._timer = new Timer(delay);

			return this;
		}
	}, {
		key: 'subscribe',
		value: function subscribe(name, handler, options) {
			if (!this.channels.hasOwnProperty(name)) {
				this.channels[name] = [];
			}
			this.channels[name].push([name + '', handler, options]);

			this.connections.forEach(function (client) {
				client.subscribe(name, handler, options);
			});

			return this;
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(name, handler) {
			var _this3 = this;

			if (this.channels.hasOwnProperty(name)) {
				this.channels[name].forEach(function (subs, i) {
					if (subs[1] === handler) _this3.channels[name].splice(i, 1);
				});

				this.connections.forEach(function (client) {
					client.unsubscribe(name, handler);
				});
			}

			return this;
		}
	}, {
		key: 'dump',
		value: function dump() {
			return this.connections.map(function (client) {
				var res = (0, _assign2.default)({}, client.options);
				res.channels = {};
				for (var channel in client.channels) {
					if (client.channels.hasOwnProperty(channel)) {
						res.channels[channel] = client.channels[channel].packets;
					}
				}
				return res;
			});
		}
	}, {
		key: 'broadcast',
		value: function broadcast(channel, payload) {
			for (var i = this.connections.length - 1; i >= 0; i--) {
				this.connections[i].send(channel, payload);
			}

			return this;
		}
	}, {
		key: 'whisper',
		value: function whisper(channel, payload) {
			for (var i = this.connections.length - 1; i >= 0; i--) {
				for (var u in this.connections[i].channels) {
					if (this.connections[i].channels[u].name === channel) {
						this.connections[i].channels[u].send(payload);
					}
				}
			}

			return this;
		}
	}, {
		key: 'stop',
		value: function stop() {
			var _this4 = this;

			var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

			var adapter = adapters.resolve(this.options.adapter);

			debug('warn: stopping server');

			if (this._timer) this._timer.stop();

			if (this.listener) {
				_promise2.default.resolve().then(function () {
					_this4.connections.forEach(adapter.disconnect);
					_this4.connections.length = 0;
					adapter.stop(_this4, callback);
					_this4.listener = null;
				}).then(null, this.handleError);
			} else {
				this.listener = null;
				process.nextTick(callback);
			}
		}
	}, {
		key: 'createClient',
		value: function createClient(options, socket) {
			var _this5 = this;

			var client = new Client(options, socket);
			(0, _keys2.default)(this.channels).forEach(function (channel) {
				_this5.channels[channel].forEach(function (subs) {
					client.subscribe.apply(client, subs);
				});
			});
			return client;
		}
	}, {
		key: 'handleError',
		value: function handleError(err) {
			debug('error: ' + err);
			this.emit('error', err);
		}
	}, {
		key: 'handleRequest',
		value: function handleRequest(socket) {
			var _this6 = this;

			var client = this.createClient({
				adapter: this.options.adapter,
				encoder: this.options.encoder,
				tick: this._timer
			}, socket);
			this.connections.push(client);
			client.on('disconnect', function (socket) {
				_this6.emit('disconnect', socket);
				_this6.emit('disconnection', socket);
			});
			this.emit('connection', client);
			this.emit('connect', client);
			return client;
		}
	}]);
	return Server;
}(EventEmitter);

module.exports = Server;
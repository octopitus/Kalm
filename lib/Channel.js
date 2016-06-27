

'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('kalm');

var crypto = require('crypto');

var Channel = function () {
	function Channel(name, options, client) {
		(0, _classCallCheck3.default)(this, Channel);

		this.id = crypto.randomBytes(20).toString('hex');
		this.name = name;
		this.options = options;

		this._client = client;
		this._emitter = client._emit.bind(client);

		this._timer = null;
		this._bound = false;
		this.packets = [];
		this.handlers = [];

		this.splitBatches = options.splitBatches;

		if (this.options.serverTick) {
			if (!client.tick) {
				debug('warn: no server heartbeat, ignoring serverTick config');
				this.options.serverTick = false;
			}
		}
	}

	(0, _createClass3.default)(Channel, [{
		key: 'send',
		value: function send(payload, once) {
			if (once) this.packets = [payload];else this.packets.push(payload);

			if (this.packets.length >= this.options.maxPackets) {
				this._emit();
				return;
			}

			this.startBundler();
		}
	}, {
		key: 'startBundler',
		value: function startBundler() {
			if (this.options.serverTick) {
				if (!this._bound) {
					this._bound = true;
					this._client.tick.once('step', this._emit.bind(this));
				}
			} else {
				if (this._timer === null) {
					this._timer = setTimeout(this._emit.bind(this), this.options.delay);
				}
			}
		}
	}, {
		key: '_emit',
		value: function _emit() {
			if (this.packets.length > 0) {
				this._emitter(this.name, this.packets.concat());
				this.packets.length = 0;
			}

			this.resetBundler();
		}
	}, {
		key: 'resetBundler',
		value: function resetBundler() {
			if (this.options.serverTick) {
				this._bound = false;
			} else {
				clearTimeout(this._timer);
				this._timer = null;
			}
		}
	}, {
		key: 'addHandler',
		value: function addHandler(method, bindOnce) {
			this.handlers.push(method);
		}
	}, {
		key: 'removeHandler',
		value: function removeHandler(method) {
			var index = this.handlers.indexOf(method);
			if (index > -1) this.handlers.splice(index, 1);
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			this._client.destroy();
		}
	}, {
		key: 'handleData',
		value: function handleData(payload) {
			var _reqs = payload.length;
			var _listeners = this.handlers.length;
			var reply = this.send.bind(this);
			var i = void 0;
			var c = void 0;

			if (this.splitBatches) {
				for (i = 0; i < _reqs; i++) {
					for (c = 0; c < _listeners; c++) {
						this.handlers[c](payload[i], reply, this);
					}
				}
			} else {
				for (c = 0; c < _listeners; c++) {
					this.handlers[c](payload, reply, this);
				}
			}
		}
	}]);
	return Channel;
}();

module.exports = Channel;


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

var EventEmitter = require('events').EventEmitter;

var Timer = function (_EventEmitter) {
	(0, _inherits3.default)(Timer, _EventEmitter);

	function Timer(delay) {
		(0, _classCallCheck3.default)(this, Timer);

		var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Timer).call(this));

		_this.delay = delay;
		_this.timer = null;

		_this.start();
		return _this;
	}

	(0, _createClass3.default)(Timer, [{
		key: 'start',
		value: function start() {
			var _this2 = this;

			if (this.timer) this.stop();
			this.timer = setInterval(function (e) {
				return _this2.emit('step');
			}, this.delay);
			return this;
		}
	}, {
		key: 'stop',
		value: function stop() {
			clearInterval(this.timer);
			this.timer = null;
		}
	}]);
	return Timer;
}(EventEmitter);

module.exports = Timer;
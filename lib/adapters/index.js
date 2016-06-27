

'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Store = require('../Store');

var is_browser = process.env.NODE_ENV === 'browser';

var ipc = is_browser ? null : require('./ipc');
var tcp = is_browser ? null : require('./tcp');
var udp = is_browser ? null : require('./udp');

var Adapters = function (_Store) {
	(0, _inherits3.default)(Adapters, _Store);

	function Adapters() {
		(0, _classCallCheck3.default)(this, Adapters);

		var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Adapters).call(this, 'adapter'));

		_this.list.ipc = ipc;
		_this.list.tcp = tcp;
		_this.list.udp = udp;
		return _this;
	}

	return Adapters;
}(Store);

module.exports = new Adapters();
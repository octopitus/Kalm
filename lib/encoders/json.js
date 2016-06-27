

'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var Encoder = require('./common');

var JSONEncoder = function (_Encoder) {
	(0, _inherits3.default)(JSONEncoder, _Encoder);

	function JSONEncoder() {
		(0, _classCallCheck3.default)(this, JSONEncoder);
		return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(JSONEncoder).call(this, 'json'));
	}

	(0, _createClass3.default)(JSONEncoder, [{
		key: 'encode',
		value: function encode(payload) {
			return new Buffer((0, _stringify2.default)(payload));
		}
	}, {
		key: 'decode',
		value: function decode(payload) {
			return JSON.parse(payload.toString());
		}
	}]);
	return JSONEncoder;
}(Encoder);

module.exports = new JSONEncoder();
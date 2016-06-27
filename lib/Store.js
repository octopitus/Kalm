

'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('kalm');

var Store = function () {
	function Store(type) {
		(0, _classCallCheck3.default)(this, Store);

		this.type = type;
		this.list = {};
	}

	(0, _createClass3.default)(Store, [{
		key: 'resolve',
		value: function resolve(name) {
			if (this.list.hasOwnProperty(name)) {
				return this.list[name];
			} else {
				debug('error: no key "' + name + '" found in ' + this.type);
				return;
			}
		}
	}, {
		key: 'register',
		value: function register(name, mod) {
			debug('log: registering new key "' + name + '" in ' + this.type + 's');
			this.list[name] = mod;
		}
	}]);
	return Store;
}();

module.exports = Store;
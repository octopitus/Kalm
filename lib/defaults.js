

'use strict';

module.exports = {
	hostname: '0.0.0.0',
	port: 3000,
	adapter: 'tcp',
	encoder: 'json',
	stats: false,
	tick: null,
	socketTimeout: 1000 * 30,
	rejectForeign: true,
	bundler: {
		maxPackets: 2048,
		serverTick: false,
		delay: 16,
		splitBatches: true
	}
};
var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: __dirname + '/index.js',
	target: 'node',
	output: {
		filename: 'kalm.min.js',
		path: __dirname + '/bin',
		library: 'kalm'
	},
	plugins: [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.DefinePlugin({
		  'process.env': {
		    'NODE_ENV': JSON.stringify('browser')
		  }
		}),
		new webpack.optimize.UglifyJsPlugin({
		  compress: {
		    warnings: false
		  },
		  output: {
		    comments: false
		  }
		})
	],
	module: {
		loaders: [
			{ test: /\.js$/, loader: 'babel' }
		]
	}
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractPlugin = new ExtractTextPlugin({
  filename: "bundle.css"
});

const config = {
	entry: path.resolve(__dirname,'app/index.jsx'),
	output: {
		path: path.resolve(__dirname,'dist'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.(jsx|js)$/,
				use: {
					loader: 'babel-loader',
					options:{
						presets: ['env','react','babel-preset-stage-0']
					}
				}
			},
			{
				test: /\.(less|css)$/,
                use: extractPlugin.extract({
                    use: [
                        {loader: "css-loader"},
                        {loader: "less-loader"}
                    ],
                    fallback: "style-loader"
                })
			},
            {
                test: /\.(png|jpg|woff|woff2|eot|ttf|otf|svg|gif)$/,
                loader: 'file-loader'
            }
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname,'app/index.html'),
			minify: {
				html5: true
			}
		}),
		extractPlugin
	]
}


module.exports = config;

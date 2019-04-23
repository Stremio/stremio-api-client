const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = () => ({
    entry: './index.site.js',
    mode: 'production',
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'apiClient.js'
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: true,
                    output: {
                        beautify: false,
                        wrap_iife: true
                    }
                }
            })
        ]
    }
});
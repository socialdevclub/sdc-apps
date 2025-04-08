const { WebpackPnpExternals } = require('webpack-pnp-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

/**
 * @link https://docs.nestjs.com/recipes/hot-reload
 */
module.exports = function (options, webpack) {
  require('dotenv').config({ encoding: 'utf8', path: '.env' });

  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      WebpackPnpExternals({
        exclude: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.EnvironmentPlugin(Object.keys(process.env)),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({ autoRestart: false, name: options.output.filename }),
    ],
  };
};

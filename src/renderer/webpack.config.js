const path = require('path');

module.exports = {
    entry: path.join(__dirname, "./chapter.js"),
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    devtool: 'inline-source-map',
    module: {
        loaders: [
          {
            test: /.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: ['env']
            }
          }
        ]
    },
    resolve: {
        extensions: [".js"]
    },
    resolveLoader: {
        // why is this necessary? is babel-loader installed weirdly?
        modules: [path.join(__dirname, "../../node_modules")],
        extensions: [".js"]
    }
};

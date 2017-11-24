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
    }
};

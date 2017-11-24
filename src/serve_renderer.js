const express = require('express');
const path = require('path');

module.exports = ({bookSourceDirectory}) => new Promise((resolve, reject) => {
    const port = 3001;
    const app = express();
    
    const Webpack = require("webpack");
    const webpackMiddleware = require("webpack-dev-middleware");
    const webpackConfig = require("./renderer/webpack.config");
    
    const compiler = Webpack(webpackConfig);
    app.use(webpackMiddleware(compiler));
    
    app.use(express.static(path.join(__dirname, 'renderer')));


    app.use('/static', express.static(bookSourceDirectory));

    app.listen(port, () => {
        resolve({
            port,
            app
        });
    });
});

const express = require('express');
const path = require('path');
const fs = require('fs');

const rendererHtmlTemplate = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'renderer/index.html'), {encoding:'utf8'}, (err, data) => {
        if(err) {
            reject(err);
        }
        else {
            resolve(data);
        }
    })
});

module.exports = ({bookSourceDirectory}) => new Promise((resolve, reject) => {
    const port = 3001;
    const app = express();
    
    const Webpack = require("webpack");
    const webpackMiddleware = require("webpack-dev-middleware");
    const webpackConfig = require("./renderer/webpack.config");
    
    const compiler = Webpack(webpackConfig);
    app.use('/renderer', webpackMiddleware(compiler));

    app.use('/renderer', express.static(path.join(__dirname, 'renderer')));

    app.listen(port, () => {
        resolve({
            port,
            app
        });
    });
});

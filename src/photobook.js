const express = require('express');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const photochapter = sourceDirectory => {
    return new Promise((resolve, reject) => {

        const port = 3000;

        const app = express();
        app.get('/', (req, res) => res.send('Hello World!'));

        const httpServer = require('http').createServer(app);
        httpServer.listen({ port }, () => {
            console.log('server listening!?');
            console.log('Example app listening on port 3000!');

            const outputFilePath = path.join(process.cwd(), sourceDirectory, '.pdf');

            const electronPdf = child_process.spawn(
                path.join(__dirname, '../node_modules/electron-pdf/cli.js'),
                [
                    `http://0.0.0.0:${port}/`,
                    outputFilePath
                ]
            );

            electronPdf.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            electronPdf.stderr.on('data', (data) => {
                console.log(`stderr: ${data}`);
            });

            electronPdf.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
                httpServer.close();
                resolve(outputFilePath);
            });
        });




        // app.listen(port, () => {

        // });

    });
};

module.exports = function(sourceDirectory) {
    return new Promise((resolve, reject) => {

        fs.readdir(sourceDirectory, (err, chapterDirs) => {
            if (err) {
                reject(`Could not list files in directory ${sourceDirectory}`);
            }
            else {
                (async function makeChapters() {
                    for (const chapterDir of chapterDirs) {
                        await photochapter(chapterDir);
                    }
                })().then(() => {
                    resolve();
                });

                
                // chapterDirs.forEach(chapterDir => {
                //     try {
                //         await photochapter(chapterDir);
                //     }
                //     catch(e) {
                //         reject(e);
                //     }
                // });

                // resolve();

                // return Promise.all(chapterDirs.map(photochapter));
            }
        });

    });
};

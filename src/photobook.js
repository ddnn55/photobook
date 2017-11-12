const express = require('express');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const photochapter = (sourceDirectory, options) => {
    options = options || {};

    return new Promise((resolve, reject) => {

        const outputFilePath = path.join(
            process.cwd(),
            path.basename(sourceDirectory),
            '.pdf'
        );
        console.log(outputFilePath);

        if (!options.dryRun) {
            const port = 3000;
            const app = express();
            app.get('/', (req, res) => res.send('Hello World!'));

            const httpServer = require('http').createServer(app);
            httpServer.listen({ port }, () => {
                console.log('server listening!?');
                console.log('Example app listening on port 3000!');

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
        }
        else {
            resolve();
        }

    });
};

module.exports = function (sourceDirectory, options) {
    options = options || {};

    return new Promise((resolve, reject) => {

        fs.readdir(sourceDirectory, (err, chapterDirs) => {
            if (err) {
                reject(`Could not list files in directory ${sourceDirectory}`);
            }
            else {
                (async function makeChapters() {
                    for (const chapterDir of chapterDirs) {
                        await photochapter(chapterDir, options);
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

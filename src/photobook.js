const express = require('express');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const chapterHtml = require('./chapter_html');

// should be more rigorous lol
const isImage = filename => filename !== '.DS_Store';

const photochapter = (sourceDirectory, options) => {
    options = options || {};

    return new Promise((resolve, reject) => {

        // console.log(path.parse(sourceDirectory));

        const outputFilePath = path.join(
            process.cwd(),
            path.parse(sourceDirectory).name + '.pdf'
        );
        console.log(outputFilePath);

        if (!options.dryRun) {
            const port = 3000;
            const app = express();
            app.get('/', (req, res) => {

                fs.readdir(sourceDirectory, (err, possibleImagePaths) => {
                    if(err) {
                        reject(`Could not list files in directory ${sourceDirectory}`);
                    }
                    else {
                        const imageFilenames = possibleImagePaths.filter(isImage).map(
                            imagePath => path.parse(imagePath).base
                        );
                        chapterHtml(imageFilenames).then(html => {
                            res.send(html);
                        }).catch(err => {
                            reject(err);
                        });
                        
                    }
                });

            });
            app.use('/static', express.static(sourceDirectory));

            const httpServer = require('http').createServer(app);
            httpServer.listen({ port }, () => {
                console.log('listening on port 3000!');

                let args = [
                    `http://0.0.0.0:${port}/`,
                    outputFilePath
                ];
                if(options.pageSize) {
                    args = args.concat([
                        '--page-size',
                        options.pageSize
                    ]);
                }
                const electronPdf = child_process.spawn(
                    path.join(__dirname, '../node_modules/electron-pdf/cli.js'),
                    args
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

const makeChapterIfDirectory = (chapterDirFullPath, options) => {
    return new Promise((resolve, reject) => {
        fs.lstat(chapterDirFullPath, (err, stats) => {
            
            if(err) {
                reject(`Could not test if ${chapterDirFullPath} is a directory`);
            }
            else {
                if(stats.isDirectory()) {
                    console.log('calling photochapter with ', chapterDirFullPath);
                    photochapter(chapterDirFullPath, options).then(() => {
                        console.error('photochapter() resolved');
                        resolve();
                    }).catch(err => {
                        console.error(err);
                        reject(`Could not make chapter for ${chapterDirFullPath}`);
                    });
                }
                else {
                    resolve();
                }
            }
            
        });
        
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
                    // console.log({chapterDirs});
                    for (const chapterDir of chapterDirs) {
                        try {
                            const chapterDirFullPath = path.join(sourceDirectory, chapterDir);
                            
                            await makeChapterIfDirectory(chapterDirFullPath, options);

                        }
                        catch(e) {
                            reject(`Something went wrong while trying to make chapter for ${chapterDir}`);
                        }
                    }
                    console.error('after the loop');
                })().then(() => {
                    console.error('there');
                    resolve();
                })
                .catch(err => {
                    console.error('here', err);
                });

            }
        });

    });
};

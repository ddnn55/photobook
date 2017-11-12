const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const sharp = require('sharp');
var paperSize = require('paper-size');

const chapterHtml = require('./chapter_html');

// should be more rigorous lol
const isImage = filename => filename !== '.DS_Store';

const getImagesMetadatas = imagePaths => Promise.all(
    imagePaths.map(imagePath =>
        sharp(imagePath)
            .metadata()
            .then(function (metadata) {
                return metadata;
            })
    )
);

module.exports = (sourceDirectory, options) => {
    options = options || {};

    return new Promise((resolve, reject) => {

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
                        const imagePaths = imageFilenames.map(
                            imageFilename => path.join(sourceDirectory, imageFilename)
                        );
                        
                        getImagesMetadatas(imagePaths)
                        .then(imageMetadatas => {
                            return imageMetadatas.map(
                                (imageMetadata, i) => ({
                                    metadata: imageMetadata,
                                    filename: imageFilenames[i]
                                })
                            );
                        })
                        .then(
                            images => chapterHtml(images, {
                                pageSize: paperSize.getSize(
                                    options.pageSize.toLowerCase(),
                                    { unit: 'mm' }
                                )
                            })
                        )
                        .then(html => {
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
                        `--pageSize`,
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

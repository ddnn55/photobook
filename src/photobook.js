const fs = require('fs');
const path = require('path');
var paperSize = require('paper-size');

const photochapter = require('./photochapter');

const makeChapterIfDirectory = (chapterDirFullPath, options) => {
    return new Promise((resolve, reject) => {
        fs.lstat(chapterDirFullPath, (err, stats) => {
            
            if(err) {
                reject(`Could not test if ${chapterDirFullPath} is a directory`);
            }
            else {
                if(stats.isDirectory()) {
                    // console.log('calling photochapter with ', chapterDirFullPath);
                    photochapter(chapterDirFullPath, options).then(() => {
                        // console.error('photochapter() resolved');
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
    
    options.pageSize = options.pageSize || 'A4';
    options.pageSize = {
        name: options.pageSize,
        dimensions: paperSize.getSize(
            options.pageSize.toLowerCase(),
            { unit: 'mm' }
        )
    };

    console.error(`Page Size (${options.pageSize.name}): ${options.pageSize.dimensions[0]}mm x ${options.pageSize.dimensions[1]}mm`);

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

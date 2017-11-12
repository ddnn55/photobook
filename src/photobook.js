const fs = require('fs');
const path = require('path');

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

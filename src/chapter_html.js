const fs = require('fs');
const path = require('path');
const flatten = require('lodash.flatten');

const layOutPage = require('./lay_out_page');

const getCss = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'styles.css'), { encoding: 'utf8' }, (err, data) => {
        if (err) {
            reject('Could not read styles.css');
        }
        else {
            // console.error('got styles.css');
            resolve(data);
        }
    });
});

const renderPage = page => page.map((placedImage, i) => {
    const imageUrl = `static/${placedImage.image.filename}`;
    return `
        <img class="photo" src="${imageUrl}"
            style="
                left: ${placedImage.placement.x}mm;
                top: ${placedImage.placement.y}mm;
                width: ${placedImage.placement.w}mm;
                height: ${placedImage.placement.h}mm;
            "
        />
    `;
}).join('\n');

module.exports = (images, options) => {
    // console.error(options.pageSize);

    const layoutWidth = options.pageSize[0];
    // fudge to keep pages from bleeding onto next page and
    // gradually offsetting everything more and more with
    // each new page :(
    const layoutHeight = options.pageSize[1] * 0.98;

    const pages = [];

    for (var first = 0; first < images.length; first = flatten(pages).length) {
        const { placed } = layOutPage(
            images.slice(first),
            [
                layoutWidth,
                layoutHeight
            ],
            options.targetPhotosPerPage || images.length
        );
        pages.push(placed);
    }


    console.error(`total: ${images.length}`);
    console.error('pages: ', pages.map(page => page.length));

    // console.error('after layOutPage', placedImages);

    return new Promise((resolve, reject) => {
        getCss.then(css => {
            resolve(`
                <style>${css}</style>
                ${pages.map(page => `
                    <div class="page" style="
                        width: ${layoutWidth}mm;
                        height: ${layoutHeight}mm;
                    ">
                        ${renderPage(page)}
                    </div>
                `)}
            `);
        }).catch(err => {
            reject(err);
        });
    });

};

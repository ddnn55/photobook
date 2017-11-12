const fs = require('fs');
const path = require('path');

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

module.exports = (images, options) => {
    // console.error(options.pageSize);
    const placedImages = layOutPage(images, options.pageSize);
    // console.error('after layOutPage', placedImages);

    return new Promise((resolve, reject) => {
        getCss.then(css => {
            resolve(`
                <style>${css}</style>
                ${placedImages.map((placedImage, i) => {
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
                        ${placedImage.image.metadata.width} x ${placedImage.image.metadata.height}
                    `;
                }).join('\n')}
            `);
        }).catch(err => {
            reject(err);
        });
    });

};

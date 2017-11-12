const fs = require('fs');
const path = require('path');

const getCss = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'styles.css'), { encoding: 'utf8' }, (err, data) => {
        if (err) {
            reject('Could not read styles.css');
        }
        else {
            console.error('got styles.css');
            resolve(data);
        }
    });
});

module.exports = images => {
    return new Promise((resolve, reject) => {
        getCss.then(css => {
            resolve(`
                <style>${css}</style>
                ${images.map(image => {
                    const imageUrl = `static/${image.filename}`;
                    return `
                        <img class="photo" src="${imageUrl}"/>
                        ${image.metadata.width} x ${image.metadata.height}
                    `;
                }).join('\n')}
            `);
        }).catch(err => {
            reject(err);
        });
    });

};

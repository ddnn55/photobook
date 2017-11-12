const fs = require('fs');
const path = require('path');

const getCss = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'styles.css'), {encoding:'utf8'}, (err, data) => {
        if(err) {
            reject('Could not read styles.css');
        }
        else {
            console.error('got styles.css');
            resolve(data);
        }
    });
});

module.exports = imageFilenames => {
    return new Promise((resolve, reject) => {
        getCss.then(css => {
            resolve(`
                <style>${css}</style>
                ${imageFilenames.map(imageFilename => {
                    const imageUrl = `static/${imageFilename}`;
                    return `
                        <img class="photo" src="${imageUrl}"/><br/>
                    `;
                }).join('<br/>')}
            `);
        }).catch(err => {
            reject(err);
        });
    });

};

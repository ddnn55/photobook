const flatten = require('lodash.flatten');
const superagent = require('superagent');

const layOutPage = require('./lay_out_page');

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

const html = (title, images, options) => {
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
            ]
        );
        pages.push(placed);
    }


    console.error(`total: ${images.length}`);
    console.error('pages: ', pages.map(page => page.length));

    // console.error('after layOutPage', placedImages);

    return `
        <div class="chapter-title">${title}</div>
        ${pages.map(page => `
            <div class="page" style="
                width: ${layoutWidth}mm;
                height: ${layoutHeight}mm;
            ">
                ${renderPage(page)}
            </div>
        `)}
    `;

};

// main

document.querySelector('.chapter').innerHTML = `
    <div class="chapter-title">${CHAPTER_METADATA.title}</div>
    <pre class="debug">${JSON.stringify(CHAPTER_METADATA, null, 2)}</pre>
`;

// superagent.get(`/metadata`).end((err, res) => {
//     if(err) {
//         throw err;
//     }
//     else {
//         document.querySelector('.chapter').innerHTML = res.text;
//     }
// });

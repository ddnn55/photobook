const flatten = require('lodash.flatten');
const superagent = require('superagent');
const convert = require('css-unit-converter');

const layOutPage = require('./lay_out_page');

const layoutWidth = CHAPTER_METADATA.pageSize[0];
const margins = layoutWidth * 0.04;

const renderPage = page => page.map((placedImage, i) => {
    const imageUrl = `${CHAPTER_METADATA.chapterStaticRoute}/${placedImage.image.filename}`;
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

const html = (titleHeight, images) => {
    // console.error(options.pageSize);

    
    // fudge to keep pages from bleeding onto next page and
    // gradually offsetting everything more and more with
    // each new page :(
    const layoutHeight = CHAPTER_METADATA.pageSize[1] * 0.98;
    const firstPagePhotoLayoutHeight = layoutHeight - titleHeight;

    const pages = [];

    for (var first = 0; first < images.length; first = flatten(pages).length) {
        const { placed } = layOutPage(
            images.slice(first),
            [
                layoutWidth,
                first === 0 ? firstPagePhotoLayoutHeight : layoutHeight
            ],
            {
                margins
            }
        );
        pages.push(placed);
    }


    console.error(`total: ${images.length}`);
    console.error('pages: ', pages.map(page => page.length));

    // console.error('after layOutPage', placedImages);

    return `
        ${pages.map((page, p) => `
            <div class="page" style="
                width: ${layoutWidth}mm;
                height: ${p === 0 ? firstPagePhotoLayoutHeight : layoutHeight}mm;
            ">
                ${renderPage(page)}
            </div>
        `)}
    `;

};

// main
try {

    // document.querySelector('body').setAttribute('class', 'debug');

    document.querySelector('.chapter .title').style.width = `${CHAPTER_METADATA.pageSize[0]}mm`;
    document.querySelector('.chapter .title').style.padding = `${margins}mm`;
    document.querySelector('.chapter .title').innerHTML = CHAPTER_METADATA.title;

    const titleRect = document.querySelector('.chapter .title').getBoundingClientRect();
    const titleHeight = convert(titleRect.height, 'px', 'mm');

    // document.querySelector('.console').innerHTML = JSON.stringify({
    //     titleRect, titleHeight
    // });

    document.querySelector('.chapter .photos').innerHTML = html(
        titleHeight,
        CHAPTER_METADATA.images
    );

}
catch(e) {    
    document.querySelector('.console').innerHTML = 'exception: ' + e.message;
}

setTimeout(() => document.body.dispatchEvent(new Event('view-ready')), 5000);
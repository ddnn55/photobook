var rbp = require('rectangle-bin-pack');
var sum = require('lodash.sum');

module.exports = (images, pageSize) => {
    const totalImagePixelArea = sum(images.map(
        image => image.metadata.width * image.metadata.height
    ));
    const pageMmArea = pageSize[0] * pageSize[1];
    const maxScale = Math.sqrt(pageMmArea / totalImagePixelArea);
    
    // TBD
    const scale = maxScale;

    console.error({totalImagePixelArea, maxScale});

    var rects = images.map(
        image => ({
            w: Math.floor(scale * image.metadata.width),
            h: Math.floor(scale * image.metadata.height)
        })
    );
    console.log({pageSize});
    rbp.solveSync({w: pageSize[0], h: pageSize[1]}, rects);
    return rects;
};

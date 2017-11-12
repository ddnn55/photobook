var rbp = require('rectangle-bin-pack');
var sum = require('lodash.sum');
var range = require('lodash.range');

const packWithScale = (images, pageSize, scale) => {
    console.error(`trying scale ${scale}`);
    var rects = images.map(
        image => ({
            w: Math.floor(scale * image.metadata.width),
            h: Math.floor(scale * image.metadata.height)
        })
    );
    rbp.solveSync(
        {
            w: pageSize[0],
            h: pageSize[1],
            alg: 'BestAreaFit'
            // BestShortSideFit or BSSF
            // BestLongSideFit or BLSF
            // BestAreaFit or BAF
            // BottomLeftRule or BL
            // ContactPointRule or CP
        },
        rects
    );
    const placedImages = rects
    .map((rect, r) => ({
        image: images[r],
        placement: rect
    }))
    .filter(
        placedImage => placedImage.placement.hasOwnProperty('x') && placedImage.placement.hasOwnProperty('y')
    );

    const portionAreaUsed = sum(placedImages.map(
        placedImage => placedImage.placement.w * placedImage.placement.h
    )) / (pageSize[0] * pageSize[1]);

    return {portionAreaUsed, placedImages};
};

module.exports = (images, pageSize) => {
    const totalImagePixelArea = sum(images.map(
        image => image.metadata.width * image.metadata.height
    ));
    const pageMmArea = pageSize[0] * pageSize[1];
    const maxScale = Math.sqrt(pageMmArea / totalImagePixelArea);
    
    // TBD
    const scale = maxScale;

    // console.error({maxScale});

    const sampleCount = 100;
    const lowTargetScale = Math.sqrt(0.3 * pageMmArea / totalImagePixelArea);
    const highTargetScale = Math.sqrt(pageMmArea / totalImagePixelArea);
    const step = (highTargetScale - lowTargetScale) / sampleCount;
    const samples = range(lowTargetScale, highTargetScale, step)
    .map(scale => packWithScale(
        images,
        pageSize,
        scale
    ))
    .sort((a, b) => {
        if(a.portionAreaUsed < b.portionAreaUsed) {
            return -1;
        }
        else if(a.portionAreaUsed > b.portionAreaUsed) {
            return 1;
        }
        else {
            return 0;
        }
    });
    // console.error(samples.map(sample => sample.portionAreaUsed));
    // const max = Math.max.apply(Math, samples.map(sample => sample.portionAreaUsed));
    // console.error('BEST: ', max);

    console.error(samples.map(sample => sample.portionAreaUsed));

    if(samples[0].placedImages.length !== images.length) {
        console.error('################### Could not pack all images on the page!');
    }

    // else {
        return samples[samples.length-1].placedImages;
    // }
};

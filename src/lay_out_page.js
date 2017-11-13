var rbp = require('rectangle-bin-pack');
var sum = require('lodash.sum');
var range = require('lodash.range');

const packWithScale = (images, pageSize, scale) => {
    // console.error(`trying scale ${scale}`);
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
    const imagesSomePlaced = rects
    .map((rect, r) => ({
        image: images[r],
        placement: rect
    }));

    const placedImages = imagesSomePlaced
    .filter(
        placedImage => placedImage.placement.hasOwnProperty('x') && placedImage.placement.hasOwnProperty('y')
    );

    const unplacedImages = imagesSomePlaced
    .filter(
        placedImage => !placedImage.placement.hasOwnProperty('x') || !placedImage.placement.hasOwnProperty('y')
    );

    const portionAreaUsed = sum(placedImages.map(
        placedImage => placedImage.placement.w * placedImage.placement.h
    )) / (pageSize[0] * pageSize[1]);

    return {portionAreaUsed, placedImages, unplacedImages};
};

module.exports = (images, pageSize, targetPhotosPerPage) => {

    console.error("Start lay_out_page. ", targetPhotosPerPage);

    const targetPhotosPixelArea = sum(images.slice(0, targetPhotosPerPage).map(
        image => image.metadata.width * image.metadata.height
    ));
    const pageMmArea = pageSize[0] * pageSize[1];



    const sampleCount = 100;
    let mostEfficientLayout;
    let lowTargetScale = Math.sqrt(pageMmArea / targetPhotosPixelArea);
    let highTargetScale = Math.sqrt(pageMmArea / targetPhotosPixelArea);

    do {
        lowTargetScale *= 0.9;
        highTargetScale *= 1.1;
        
        const step = (highTargetScale - lowTargetScale) / sampleCount;
        samples = range(lowTargetScale, highTargetScale, step)
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
        mostEfficientLayout = samples[samples.length-1];
    }
    while(mostEfficientLayout.placedImages.length < 1);
    // console.error(samples.map(sample => sample.portionAreaUsed));
    // const max = Math.max.apply(Math, samples.map(sample => sample.portionAreaUsed));
    // console.error('BEST: ', max);

    // console.error(samples.map(sample => sample.portionAreaUsed));

    

    if(mostEfficientLayout.placedImages.length !== images.length) {
        // console.error('################### Could not pack all images on the page!');
    }

    // else {
        return {
            placed: mostEfficientLayout.placedImages,
            unplaced: mostEfficientLayout.unplacedImages
        };
    // }
};

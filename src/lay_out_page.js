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

const rectangleBinPackStrategy = (images, pageSize, targetPhotosPerPage) => {
    
    console.error("Start rectangleBinPackStrategy. ", targetPhotosPerPage);

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

    mostEfficientLayout.placedImages.forEach(placedImage => {
        if(placedImage.placement.x + placedImage.placement.w > pageSize[0] ||
            placedImage.placement.y + placedImage.placement.h > pageSize[1]) {
            console.error('wtf ', placedImage.placement);
        }
    });

    // else {
        return {
            placed: mostEfficientLayout.placedImages,
            unplaced: mostEfficientLayout.unplacedImages
        };
    // }
};
    
const rowPackStrategy = (images, pageSize, maxTargetPhotosPerRow) => {

    let placedImages = [];
    let nextIndex = 0;
    var bottom = 0;

    while(
        placedImages.length < images.length
    ) {
        const targetNumberImagesNextRow = Math.max(1, [maxTargetPhotosPerRow - 1, maxTargetPhotosPerRow][
            Math.floor(Math.random() * 2)
        ]);

        const nextRowImages = images.slice(nextIndex, nextIndex + targetNumberImagesNextRow);
        const rowAspectRatio = sum(nextRowImages.map(
            nextRowImage => nextRowImage.metadata.width / nextRowImage.metadata.height
        ));
        let rowHeight = pageSize[0] / rowAspectRatio;
        if(bottom === 0 && rowHeight > pageSize[1]) {
            rowHeight = pageSize[1];
        }
        if(bottom + rowHeight > pageSize[1]) {
            // console.error(`rowAspectRatio is ${rowAspectRatio} bottom+rowHeight is ${bottom+rowHeight}, page height is ${pageSize[1]}`);
            break;
        }
        else {
            nextIndex += targetNumberImagesNextRow;
        }
        let x = 0;
        nextRowImages.forEach(
            nextRowImage => {
                const width = rowHeight * nextRowImage.metadata.width / nextRowImage.metadata.height;
                const imageBottom = bottom + rowHeight;
                placedImages.push({
                    image: nextRowImage,
                    placement: {
                        x: x,
                        y: bottom,
                        w: width,
                        h: rowHeight
                    },
                    bottom: () => imageBottom
                });
                x += width;
            }
        );

        bottom += rowHeight;
        // if(bottom > pageSize[1]) {
        //     // console.error(`bottom is ${bottom}, page height is ${pageSize[1]}`);
        //     break;
        // }
    }

    return {
        placed: placedImages,
        bottom
    };
}

const verticallyCenter = (pageLayout, pageSize) => {
    const offset = (pageSize[1] - pageLayout.bottom) / 2;
    pageLayout.placed.forEach(placedImage => {
        placedImage.placement.y += offset;
    });
    pageLayout.bottom += offset;
};

module.exports = (images, pageSize, maxTargetPhotosPerRow = 3) => {
    const pageLayout = rowPackStrategy(images, pageSize, maxTargetPhotosPerRow);
    if(/*pageLayout.placed.length === images.length &&*/ pageLayout.bottom < 0.5 * pageSize[1] && maxTargetPhotosPerRow > 1) {
        return module.exports(images, pageSize, maxTargetPhotosPerRow - 1)
    }
    else {
        verticallyCenter(pageLayout, pageSize);
        return pageLayout;
    }
    // return rectangleBinPackStrategy(images, pageSize, targetPhotosPerPage);
};

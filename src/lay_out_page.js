var sum = require('lodash.sum');
var range = require('lodash.range');


const rowPackStrategy = (images, pageSize, maxTargetPhotosPerRow, margin) => {

    let placedImages = [];
    let nextIndex = 0;
    var bottom = 0;

    // each image adds 1 margin unit vertically and horizontally.
    // the page will add the extra missing vertical and horizontal
    // margin.
    const imageSizeWithMargins = image => ({
        width: image.metadata.width + margin,
        height: image.metadata.height + margin
    });

    while(
        placedImages.length < images.length
    ) {
        const targetNumberImagesNextRow = Math.max(1, [maxTargetPhotosPerRow - 1, maxTargetPhotosPerRow][
            Math.floor(Math.random() * 2)
        ]);

        const nextRowImages = images.slice(nextIndex, nextIndex + targetNumberImagesNextRow);
        const rowAspectRatio = sum(nextRowImages.map(
            nextRowImage => imageSizeWithMargins(nextRowImage).width / imageSizeWithMargins(nextRowImage).height
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
                const width = rowHeight * imageSizeWithMargins(nextRowImage).width / imageSizeWithMargins(nextRowImage).height;
                const imageBottom = bottom + rowHeight;
                placedImages.push({
                    image: nextRowImage,
                    placement: {
                        x: x,
                        y: bottom,
                        w: width - margin,
                        h: rowHeight - margin
                    },
                    bottom: () => imageBottom
                });
                x += width;
            }
        );

        bottom += rowHeight;
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
    const pageLayout = rowPackStrategy(images, pageSize, maxTargetPhotosPerRow, pageSize[0] * 0.02);
    if(/*pageLayout.placed.length === images.length &&*/ pageLayout.bottom < 0.5 * pageSize[1] && maxTargetPhotosPerRow > 1) {
        return module.exports(images, pageSize, maxTargetPhotosPerRow - 1)
    }
    else {
        verticallyCenter(pageLayout, pageSize);
        return pageLayout;
    }
};

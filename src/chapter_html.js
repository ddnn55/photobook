module.exports = imageFilenames => {
    return imageFilenames.map(imageFilename => {
        const imageUrl = `static/${imageFilename}`;
        return `
            <img src="${imageUrl}"/><br/>
            ${imageUrl}
        `;
    }).join('<br/>');
};

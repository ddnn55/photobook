#!/usr/bin/env node

const photobook = require('../src/photobook');
const argv = require('yargs').argv;

photobook(argv.inputDirectory, {dryRun: argv.dryRun}).then((err, result) => {
    if(err) {
        console.error('Photobook creation failed.');
        console.error(err);
        process.exit(1);
    }
    else {
        console.log(result);
    }
})
.catch(err => {
    console.error('Something went wrong while creating photobook.');
    console.error(err);
    process.exit(1);
});

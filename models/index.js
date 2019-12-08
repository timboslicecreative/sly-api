const fs = require('fs');
const path = require('path');
let models = {};

let skip = [
    path.basename(__filename)
];

let files = fs.readdirSync(__dirname)
    .filter(file => (
        ~file.search(/^[^.].*\.js$/) && !skip.includes(file)
    ));

for (let model, i = 0; i < files.length; i++) {
    process.stdout.write(`\t Model ${files[i]}... `);
    model = require(path.join(__dirname, files[i]));
    models[files[i].replace('.js','')] = model;
    process.stdout.write(`Done.\n`);
}

module.exports = models;

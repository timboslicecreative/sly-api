const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

exports.render = (templateFile, data) => {
    let file = fs.readFileSync(path.resolve(__dirname, templateFile));
    let source = file.toString();
    let template = handlebars.compile(source);
    return template(data);
};
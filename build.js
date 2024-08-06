const browserify = require('browserify');
const esmify = require('esmify');
const fs = require('fs');

browserify(['render.js'], {plugin: [[esmify, {nodeModules: true}]]})
    .bundle((err, buf) => {
        if (err) {
            console.error(err);
        } else {
            fs.writeFileSync('bundle.js', buf);
        }
    });
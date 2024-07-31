const browserify = require('browserify');
const fs = require('fs');

browserify(['content.js', 'prism.js'])
    .transform('babelify', { presets: ['@babel/preset-env'] })
    .bundle((err, buf) => {
        if (err) {
            console.error(err);
        } else {
            fs.writeFileSync('bundle.js', buf);
        }
    });
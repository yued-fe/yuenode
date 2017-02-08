var gulp = require('gulp'),
    nodemon = require('gulp-nodemon');

gulp.task('nodemon', function() {
    console.log('========');
    nodemon({
        script: 'app.js',
        nodeArgs: ['--harmony'],
        env: { 'NODE_ENV': 'local', 'NODE_SITE': 'local' }
    }).on('restart');
});

gulp.task('default', ['nodemon']);

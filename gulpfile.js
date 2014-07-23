var gulp       = require('gulp'),
    browserify = require('gulp-browserify'),
    concat     = require('gulp-concat'),
    less       = require('gulp-less'),
    watch      = require('gulp-watch'),
    connect    = require('gulp-connect'),
    rimraf     = require('gulp-rimraf');

var ROOT = __dirname + '/build';

gulp.task('clean', function () {
    return gulp.src('build/', {read: false})
    .pipe(rimraf());
});

gulp.task('styles', function () {
    gulp.src('public/less/main.less')
        .pipe(less())
        .pipe(gulp.dest('build/less/'));
});

gulp.task('scripts', function () {
    gulp.src(['public/js/app.js'])
        // .pipe(react())
        .pipe(browserify({
            debug: true
        }))
        .pipe(gulp.dest('build/js/'));
});

gulp.task('images', function () {
    gulp.src(['public/img/**/*.png', 'public/img/**/*.jpg', 'public/img/**/*.gif'])
        .pipe(gulp.dest('build/img/'));
});

gulp.task('copy', function(){
    gulp.src('public/*.html')
        .pipe(gulp.dest('build/'));
});

gulp.task('watch', function() {
    gulp.watch('public/js/**/*.js', [ 'scripts' ]);
    gulp.watch('public/less/**/*.less', [ 'styles' ]);
    gulp.watch('public/img/**/*', [ 'images' ]);
    gulp.watch('public/*.html', [ 'copy' ]);
});

gulp.task('webserver', function() {
    connect.server({
        livereload: false,
        port: 8000,
        root: ['build']
    });
});

gulp.task('build', [ 'clean', 'styles', 'scripts', 'images', 'copy' ]);
gulp.task('default', ['build', 'webserver', 'watch']);
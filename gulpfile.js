/**
 * Сборка проекта
 */
const args = require('yargs').argv;
const gulp = require("gulp");
const minifyCSS = require('gulp-csso');
const sass = require('gulp-sass');
const webpack = require('webpack-stream');
var compiler = require('webpack');
const gutil = require('gulp-util');
const notifier = require('node-notifier');

gulp.task('sripts', () =>
    gulp.src('./src/index.ts')
        .pipe(webpack(require('./webpack.config.js')), compiler, (err, stats) => {
            if (error) { // кажется еще не сталкивался с этой ошибкой
                onError(error);
            } else if (stats.hasErrors()) { // ошибки в самой сборке, к примеру "не удалось найти модуль по заданному пути"
                onError(stats.toString(statsLog));
            } else {
                onSuccess(stats.toString(statsLog));
            }
        }).pipe(gulp.dest('dist/')));

gulp.task('assets', () => {
    gulp.src('./src/assets/favicons/*.*')
        .pipe(gulp.dest('dist/favicons'));

    return gulp.src('./index.html')
        .pipe(gulp.dest('dist'));
});

// Компиляция SCSS
gulp.task('css', () =>
    gulp.src('./src/assets/scss/index.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(minifyCSS())
        .pipe(gulp.dest('dist/css')));

// Основной таск сборки
gulp.task("build", ["sripts", "css", "assets"]);

gulp.task('default', ['build', "css", "assets"], () => {
    gulp.watch(['src/**/*.ts'], ['build']);
    gulp.watch(['srs/**/*.scss'], ['css']);
    gulp.watch(['*.html'], ['assets']);
});

const onError = (error) => {
    let formatedError = new gutil.PluginError('webpack', error);
    notifier.notify({ // чисто чтобы сразу узнать об ошибке
        title: `Error: ${formatedError.plugin}`,
        message: formatedError.message
    });
    done(formatedError);
};

const onSuccess = (detailInfo) => {
    gutil.log('[webpack]', detailInfo);
    done();
};
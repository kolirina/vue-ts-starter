/**
 * Сборка проекта
 */
const MODES = {
    development: "development",
    d: "development",
    production: "production",
    p: "production",
    local: "local",
};
const TARGET_DIR = "dist";

const fs = require('fs');
const path = require('path');
const replace = require("gulp-replace");
const args = require("yargs").argv;
const gulp = require("gulp");
const minifyCSS = require("gulp-csso");
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const eslint = require("gulp-eslint");
const webpack = require("webpack-stream");
const compiler = require("webpack");
const gutil = require("gulp-util");
const rename = require("gulp-rename");
const notifier = require("node-notifier");
const browserSync = require("browser-sync");
const reload = browserSync.reload;
const buildMode = MODES[args.env] || MODES.local;
const env = require("gulp-env");

env({
    vars: {
        NODE_ENV: buildMode === MODES.local ? MODES.development : buildMode,
        LOCALE: args.locale
    },
});

const webpackConfig = require("./webpack.config.js");
// webpackConfig.watch = webpackConfig.mode === "development";

// Анализ typescript-ресурсов
gulp.task("lint", () =>
    gulp.src("src/**/*.ts")
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError()),
);

gulp.task('clean', function() {
    return fs.promises.readdir(TARGET_DIR)
        .then(files => {
            const promises = files.map(file => {
                const filePath = path.join(TARGET_DIR, file);
                return fs.promises.rm(filePath, { recursive: true, force: true });
            });
            return Promise.all(promises);
        }).catch(e => {
            console.log('No dist folder');
        });
});

gulp.task("scripts", (cb) => {
    return gulp.src("./src/index.ts")
        .pipe(webpack(webpackConfig), compiler, (err, stats) => {
            console.log("ERROR", err, stats);
            if (error) { // кажется еще не сталкивался с этой ошибкой
                onError(error);
            } else if (stats.hasErrors()) {
                // ошибки в самой сборке, к примеру "не удалось найти модуль по заданному пути"
                onError(stats.toString(statsLog));
            } else {
                onSuccess(stats.toString(statsLog));
            }
        })
        .on("error", function handleError() {
            this.emit("end"); // Recover from errors
            cb();
        })
        .pipe(gulp.dest(TARGET_DIR))
        .pipe(reload({stream: true}));
});

gulp.task("assets", () => {
    gulp.src("./src/assets/favicons/*.*")
        .pipe(gulp.dest(TARGET_DIR + "/favicons"));

    gulp.src("../node_modules/vuetify/dist/vuetify.css")
        .pipe(minifyCSS())
        .pipe(gulp.dest(TARGET_DIR + "/css"));

    gulp.src("./src/assets/img/**/*.*")
        .pipe(gulp.dest(TARGET_DIR + "/img"));

    return gulp.src("./index.html")
        .pipe(gulp.dest(TARGET_DIR))
        .pipe(reload({stream: true}));
});

// Компиляция SCSS
gulp.task("css", () => {
    return gulp.src("./src/assets/scss/index.scss")
        .pipe(sass({outputStyle: "compressed"}))
        .pipe(minifyCSS({restructure: false}))
        .pipe(gulp.dest(TARGET_DIR + "/css"))
        .pipe(reload({stream: true}));
});

// Компиляция SCSS без минификации
gulp.task("css-dev", () => {
    return gulp.src("./src/assets/scss/index.scss")
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(TARGET_DIR + "/css"))
        .pipe(reload({stream: true}));
});

// Основной таск сборки
gulp.task("build-common", gulp.series("clean", gulp.parallel("scripts", "css-dev", "assets")));

// сборка с линтером
gulp.task("build", gulp.series("lint", "build-common"));

// сервер для разработки
gulp.task("dev-server", gulp.series(() => {
    browserSync.init({
        notify: true,
        online: true,
        open: false,
        port: 3050,
        proxy: "localhost:8080",
        serveStatic: [TARGET_DIR],
        ghostMode: false
    });
    gulp.watch(["../platform/**/*.ts", "src/**/*.ts", "../platform/**/*.dct", "src/**/*.dct"], {usePolling: true}, gulp.series("scripts"))
        .on("all", (_event, path) => {
            // вызываем линтер для измененных файлов
            gulp.src(path)
                .pipe(eslint())
                .pipe(eslint.format())
        });
    gulp.watch(["src/assets/scss/**/*.scss", "../platform/src/assets/scss/**/*.scss"], {usePolling: true}, gulp.parallel("css-dev"));
    gulp.watch(["*.html", "../platform/src/assets/fonts/**/*", "src/assets/fonts/**/*", "src/assets/fonts/**/*", "src/assets/static/**/*", "src/assets/img/**/*", "src/assets/js/**/*"], {usePolling: true}, gulp.series("assets"));
}));

/** Таск по умолчанию - девелоперский сервак */
gulp.task("default", gulp.series("build-common", "dev-server"));

const onError = (error) => {
    let formattedError = new gutil.PluginError("webpack", error);
    notifier.notify({ // чисто чтобы сразу узнать об ошибке
        message: formattedError.message,
        title: `Error: ${formattedError.plugin}`,
    });
    done(formattedError);
};

const onSuccess = (detailInfo) => {
    gutil.log("[webpack]", detailInfo);
    done();
};

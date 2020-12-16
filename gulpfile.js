/**
 * Сборка проекта
 */
const MODES = {
    development: "development",
    d: "development",
    production: "production",
    p: "production",
};
const TARGET_DIR = "dist";

const versionConfig = require("./src/version");
const replace = require("gulp-replace");
const args = require("yargs").argv;
const gulp = require("gulp");
const minifyCSS = require("gulp-csso");
const sass = require("gulp-sass");
const webpack = require("webpack-stream");
const compiler = require("webpack");
const gutil = require("gulp-util");
const rename = require("gulp-rename");
const notifier = require("node-notifier");
const browserSync = require("browser-sync");
const reload = browserSync.reload;
const buildMode = MODES[args.env] || "development";
const env = require("gulp-env");
env({
    vars: {
        NODE_ENV: buildMode,
    },
});
const webpackConfig = require("./webpack.config.js");
// webpackConfig.watch = webpackConfig.mode === "development";

gulp.task("scripts", () => {
    return gulp.src("./src/index.ts")
        .pipe(webpack(webpackConfig), compiler, (err, stats) => {
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
        })
        .pipe(gulp.dest(TARGET_DIR))
        .pipe(reload({stream: true}));
});

gulp.task("assets", () => {
    gulp.src("./src/assets/favicons/*.*")
        .pipe(gulp.dest(TARGET_DIR + "/favicons"));

    gulp.src("./node_modules/@fortawesome/fontawesome-free/css/all.css")
        .pipe(rename("fontawesome.css"))
        .pipe(minifyCSS())
        .pipe(gulp.dest(TARGET_DIR + "/css"));

    gulp.src("./node_modules/font-awesome-animation/dist/font-awesome-animation.css")
        .pipe(minifyCSS())
        .pipe(gulp.dest(TARGET_DIR + "/css"));

    gulp.src("./node_modules/vuetify/dist/vuetify.css")
        .pipe(minifyCSS())
        .pipe(gulp.dest(TARGET_DIR + "/css"));

    gulp.src("./node_modules/@fortawesome/fontawesome-free/webfonts/*.*")
        .pipe(gulp.dest(TARGET_DIR + "/webfonts"));

    gulp.src("./src/assets/img/**/*.*")
        .pipe(gulp.dest(TARGET_DIR + "/img"));

    gulp.src("./src/assets/js/**/*.*")
        .pipe(gulp.dest(TARGET_DIR + "/js"));

    gulp.src("./src/assets/fonts/**/*.*")
        .pipe(gulp.dest(TARGET_DIR + "/fonts"));

    gulp.src("./src/assets/static/**/*.*")
        .pipe(gulp.dest(TARGET_DIR + "/static"));

    gulp.src("./src/version.json")
        .pipe(gulp.dest(TARGET_DIR));

    return gulp.src("./index.html")
        .pipe(gulp.dest(TARGET_DIR))
        .pipe(reload({stream: true}));
});

gulp.task('version', function () {
    return gulp.src(['index.html'])
        .pipe(replace('$version', `${versionConfig.date}build${versionConfig.build}`))
        .pipe(gulp.dest(TARGET_DIR));
});

// Компиляция SCSS
gulp.task("css", () => {
    return gulp.src("./src/assets/scss/index.scss")
        .pipe(sass({outputStyle: "compressed"}))
        .pipe(minifyCSS())
        .pipe(gulp.dest(TARGET_DIR + "/css"))
        .pipe(reload({stream: true}));
});

// Основной таск сборки
gulp.task("build", gulp.parallel("scripts", "css", "assets", "version"));

/** Таск с watch */
gulp.task("default", gulp.series("build", () => {
    browserSync.init({
        notify: false,
        open: false,
        port: 3000,
        // proxy: "localhost:8080",
        proxy: "http://test.intelinvest.ru",
        serveStatic: [TARGET_DIR],
        ghostMode: false
    });
    gulp.watch(["src/**/*.ts"], gulp.parallel("scripts"));
    gulp.watch(["src/assets/scss/**/*.scss"], gulp.parallel("css"));
    gulp.watch(["*.html"], gulp.parallel("assets"));
}));

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

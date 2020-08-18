"use strict";

var gulp = require("gulp"),
  watch = require("gulp-watch"),
  prefixer = require("gulp-autoprefixer"),
  uglify = require("gulp-uglify"),
  sass = require("gulp-sass"),
  sourcemaps = require("gulp-sourcemaps"),
  cssmin = require("gulp-minify-css"),
  imagemin = require("gulp-imagemin"),
  pngquant = require("imagemin-pngquant"),
  rimraf = require("rimraf"),
  rigger = require("gulp-rigger"),
  cache = require("gulp-cache"),
  cached = require("gulp-cached"),
  pug = require("gulp-pug"),
  gulpIf = require("gulp-if"),
  newer = require("gulp-newer"),
  remember = require("gulp-remember"),
  path = require("path"),
  notify = require("gulp-notify"),
  plumber = require("gulp-plumber"),
  eslint = require("gulp-eslint"),
  browserSync = require("browser-sync"),
  reload = browserSync.reload,
  fs = require("fs");

var pathStatic = {
  build: {
    html: "build/",
    css: "build/css/",
    js: "build/js/",
    img: "build/img/",
    fonts: "build/fonts/",
  },
  src: {
    html: "src/*.pug",
    css: "src/scss/core/style.scss",
    js: "src/js/**/*.js",
    img: "src/img/**/*.+(png|jpg|svg|jpeg)",
    fonts: "src/fonts/**/*.*",
  },
  watch: {
    html: "src/**/*.pug",
    css: "src/scss/**/*.scss",
    js: "src/js/**/*.js",
    img: "src/img/**/*.+(png|jpg|svg|jpeg)",
    fonts: "src/fonts/**/*.*",
  },
  clean: "./build",
};

const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV == "development";

var config = {
  server: {
    baseDir: "./build",
  },
  notify: false,
  host: "localhost",
  port: 9000,
  logPrefix: "BearCoder",
};

gulp.task("webserver", function () {
  browserSync(config);
});

gulp.task("clean", function (cb) {
  rimraf(pathStatic.clean, cb);
});

gulp.task("html:build", function () {
  return gulp
    .src(pathStatic.src.html)
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "html",
            message: err.message,
          };
        }),
      })
    )
    .pipe(cached("html"))
    .pipe(newer(pathStatic.build.html))
    .pipe(pug({}))
    .pipe(rigger())
    .pipe(remember("html"))
    .pipe(gulp.dest(pathStatic.build.html))
    .pipe(reload({ stream: true }));
});

gulp.task("js:build", function () {
  return (
    gulp
      .src(pathStatic.src.js)
      .pipe(
        plumber({
          errorHandler: notify.onError(function (err) {
            return {
              title: "js",
              message: err.message,
            };
          }),
        })
      )
      .pipe(cached("js"))
      .pipe(newer(pathStatic.build.js))
      // .pipe(eslint())
      // .pipe(eslint.format())
      .pipe(rigger())
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(uglify())
      .pipe(gulpIf(isDevelopment, sourcemaps.write()))
      .pipe(remember("js"))
      .pipe(gulp.dest(pathStatic.build.js))
      .pipe(reload({ stream: true }))
  );
});

gulp.task("css:build", function () {
  return (
    gulp
      .src(pathStatic.src.css)
      .pipe(
        plumber({
          errorHandler: notify.onError(function (err) {
            return {
              title: "css",
              message: err.message,
            };
          }),
        })
      )
      // .pipe(cached("css"))
      .pipe(newer(pathStatic.build.css))
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(
        sass({
          sourceMap: true,
          errLogToConsole: true,
        })
      )
      .pipe(
        prefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
          cascade: true,
        })
      )
      .pipe(gulpIf(!isDevelopment, cssmin()))
      .pipe(gulpIf(isDevelopment, sourcemaps.write()))
      .pipe(remember("css"))
      .pipe(gulp.dest(pathStatic.build.css))
      .pipe(reload({ stream: true }))
  );
});

gulp.task("img:build", function () {
  return gulp
    .src(pathStatic.src.img)
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "img",
            message: err.message,
          };
        }),
      })
    )
    .pipe(cached("img"))
    .pipe(newer(pathStatic.build.img))
    .pipe(
      cache(
        imagemin({
          progressive: true,
          svgoPlugins: [{ remoteViewBox: false }],
          use: [pngquant()],
          interlaced: true,
        })
      )
    )
    .pipe(remember("img"))
    .pipe(gulp.dest(pathStatic.build.img))
    .pipe(reload({ stream: true }));
});

gulp.task("fonts:build", function () {
  return gulp
    .src(pathStatic.src.fonts)
    .pipe(cached("fonts"))
    .pipe(newer(pathStatic.build.fonts))
    .on(
      "error",
      notify.onError(function (err) {
        return {
          title: "fonts",
          message: err.message,
        };
      })
    )
    .pipe(remember("fonts"))
    .pipe(gulp.dest(pathStatic.build.fonts))
    .pipe(reload({ stream: true }));
});

gulp.task("cacheClear", function () {
  cache.clearAll();
});

gulp.task(
  "build",
  gulp.series("html:build", "css:build", "js:build", "img:build", "fonts:build")
);

gulp
  .watch(pathStatic.watch.html, gulp.series("html:build"))
  .on("unlink", function (filepath) {
    remember.forget("html", path.resolve(filepath));
    delete cached.cashes.styles[path.resolve.filepath];
  });
gulp
  .watch(pathStatic.watch.css, gulp.series("css:build"))
  .on("unlink", function (filepath) {
    remember.forget("css", path.resolve(filepath));
    delete cached.cashes.styles[path.resolve.filepath];
  });
gulp
  .watch(pathStatic.watch.js, gulp.series("js:build"))
  .on("unlink", function (filepath) {
    remember.forget("js", path.resolve(filepath));
    delete cached.cashes.styles[path.resolve.filepath];
  });
gulp
  .watch(pathStatic.watch.img, gulp.series("img:build"))
  .on("unlink", function (filepath) {
    remember.forget("img", path.resolve(filepath));
    delete cached.cashes.styles[path.resolve.filepath];
  });
gulp
  .watch(pathStatic.watch.fonts, gulp.series("fonts:build"))
  .on("unlink", function (filepath) {
    remember.forget("fonts", path.resolve(filepath));
    delete cached.cashes.styles[path.resolve.filepath];
  });

gulp.task("default", gulp.series("build", gulp.parallel("webserver")));

// const { exec } = require("child_process");

// function checkModule(name) {
//   try {
//     checkPath(require.resolve(name));
//     console.log(require.resolve(name));
//     install
//       .execCommand(name)
//       .then((res) => {
//         console.log(res);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   } catch (e) {
//     console.error(`${name} is not found`);
//     process.exit(e.code);
//   }
// }

// function installModule() {
//   this.execCommand = function (module) {
//     return new Promise((resolve, reject) => {
//       exec("npm install " + module, (error, stdout, stderr) => {
//         if (error) {
//           reject(`error: ${error.message}`);
//           return;
//         }
//         if (stderr) {
//           resolve(`stderr: ${stderr}`);
//           return;
//         }
//         resolve(`stdout: ${stdout}`);
//       });
//     });
//   };
// }

// var install = new installModule();

// checkModule("gulp-notify");

// function checkPath(path) {
//   console.log(typeof path);
//   if (!fs.existsSync(`${path}`))
//     fs.mkdir(path, (err) => {
//       if (err) throw err;
//     });
// }

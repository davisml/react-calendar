var lr = null

var gulp = require('gulp')
var jade = require('gulp-jade')
var gutil = require('gulp-util')
/* Compile Stylus */
var stylus = require('gulp-stylus')
var nib = require('nib')
var bootstrap = require('bootstrap-styl')
/* Compile React */
var browserify = require('browserify')
var watchify = require('watchify')
var babelify = require('babelify')
/* Nice Browserify Errors */
var chalk = require('chalk')
/* Source Stream / Merge */
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var merge = require('utils-merge')
/* Minification and Source Maps */
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var sourcemaps = require('gulp-sourcemaps')

var sources = {
    jade: "src/jade/*.jade",
    stylus: "src/stylus/*.styl",
    js: "src/jsx/app.jsx"
}

var destinations = {
    html: "dist/",
    css: "dist/css",
    js: "dist/js"
}

// Color errors with chalk
function map_error(err) {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
      + ': '
      + 'Line '
      + chalk.magenta(err.lineNumber)
      + ' & '
      + 'Column '
      + chalk.magenta(err.columnNumber || err.column)
      + ': '
      + chalk.blue(err.description))
  } else {
    // browserify error..
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message))
  }

  if (this.end) {
      this.end()
  }
}

// Compile jade templates
gulp.task("jade", function(event) {
    return gulp.src(sources.jade).pipe(jade({
        pretty: true
    })).pipe(gulp.dest(destinations.html))
})

// Compile stylus templates
gulp.task("stylus", function(event) {
    console.log("stylus")

    return gulp.src(sources.stylus).pipe(stylus({
        use: [bootstrap(), nib()],
        compress: true
    })).pipe(gulp.dest(destinations.css))
})

// Watchify
gulp.task('watchify', function () {
    var args = merge(watchify.args, { debug: true })
    var bundler = watchify(browserify(sources.js, args)).transform(babelify, { presets: ['es2015', 'react'] })
    bundle_js(bundler)
    
    bundler.on('update', function () {
        bundle_js(bundler)
    })
})

// Without watchify
gulp.task('browserify', function () {
    var bundler = browserify(sources.js, { debug: true }).transform(babelify, {/* options */ })
    
    return bundle_js(bundler)
})

// Without sourcemaps
gulp.task('browserify-production', function () {
  var bundler = browserify(sources.js).transform(babelify, {/* options */ })

  return bundler.bundle()
    .on('error', map_error)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(rename('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
})

function bundle_js(bundler) {
  return bundler.bundle()
    .on('error', map_error)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/js'))
    .pipe(rename('app.min.js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
      // capture sourcemaps from transforms
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
}

gulp.task("watch", function() {
    gulp.watch(sources.jade, ["jade"])
    gulp.watch(sources.stylus, ["stylus"])
    gulp.watch('dist/**/*', refresh)
});

gulp.task('serve', function () {
    require('./server.js')
    lr = require('tiny-lr')()
    lr.listen(35729)
})

gulp.task("default", ["jade", "stylus", "watch", "watchify", "serve"])

refresh = function(event) {
    var fileName = require('path').relative(__dirname, event.path)
    gutil.log.apply(gutil, [gutil.colors.magenta(fileName), gutil.colors.cyan('built')])
    lr.changed({
        body: { files: [fileName] }
    })
}
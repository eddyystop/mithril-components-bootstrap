// Minor modifications to https://github.com/insin/msx/gulpfile.js
'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')(); // checks package.json

var msx = require('./vendor/msx/msx-main');
var through = require('through2');

var jsxSrc= './componentsJsx/**/*.js';
var jsxDestBase = './dist/componentsJsx';

var log = plugins.util.log;

function msxTransform(name) {
  return through.obj(function (file, enc, cb) {
    try {
      file.contents = new Buffer(msx.transform(file.contents.toString()));
      file.path = plugins.util.replaceExtension(file.path, '.js');
    }
    catch (err) {
      err.fileName = file.path;
      this.emit('error', new plugins.util.PluginError('msx', err));
    }
    this.push(file);
    cb();
  });
}

gulp.task('clean', function () {
  return gulp.src(jsxDestBase, {read: false})
    .pipe(plugins.clean());
});

gulp.task('jsx', ['clean'], function() {
  return gulp.src(jsxSrc)
    .pipe(plugins.plumber())
    .pipe(plugins.includeJs({ext:'html', cache:true, showFiles:'Building'}))
    .pipe(msxTransform())
    .on('error', function(e) {
      console.error(e.message + '\n  in ' + e.fileName);
    })
    .pipe(gulp.dest(jsxDestBase));
});

// build distributions =========================================================

gulp.task('uiJsConcat', function () {
  gulp.src([
    './components/utils/mcUtils.js',
    './componentsUi/**/*.js'
  ])
    .pipe(plugins.concat('componentsUi.js'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('uiCssConcat', function () {
  gulp.src([
    './componentsUi/**/*.css'
  ])
    .pipe(plugins.concat('componentsUi.css'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('ui', ['uiJsConcat', 'uiCssConcat']);

// build tests =================================================================

gulp.task('testConcat', function () {
  gulp.src([
    './tests/test.js',
    './tests/normalizeJsx.js',
    './public/vendor/js/mithril.js',
    './components/utils/mcUtils.js',
    './componentsUi/**/*.js',
    './tests/src/*.js',
    './tests/testSummarize.js'
  ])
    .pipe(plugins.concat('tests-all.js'))
    .pipe(gulp.dest('./tests/build'))
});

gulp.task('testJsx', function() {
  return gulp.src('./tests/build/tests-all.js')
    .pipe(plugins.plumber())
    .pipe(plugins.includeJs({ext:'js', cache:true, showFiles:'Building'}))
    .pipe(msxTransform())
    .on('error', function(e) {
      console.error(e.message + '\n  in ' + e.fileName);
    })
    .pipe(gulp.dest('./tests/run'));
});
gulp.task('test', ['testConcat', 'testJsx'], function () {
  require('./tests/run/tests-all.js');
});

gulp.task('watch', function() {
  gulp.watch([jsxSrc], ['jsx']);
});

gulp.task('default', ['watch', 'jsx']);

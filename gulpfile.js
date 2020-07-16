'use strict'

var gulp = require('gulp')
var mocha = require('gulp-mocha')
var jshint = require('gulp-jshint')
var stylish = require('jshint-stylish')
var istanbul = require('gulp-istanbul')
var packageJSON = require('./package')
var jshintConfig = packageJSON.jshintConfig
var del = require('del')

var sourceFiles = ['*.js', 'backends/*.js', 'lib/*.js', 'routes/*.js', 'stores/*.js']

gulp.task('clean', function () {
  return del(['tmp/**/*', '!tmp/', '!tmp/.gitkeep'])
})

gulp.task('lint', function () {
  return gulp.src(sourceFiles)
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter(stylish))
})

gulp.task('unittest', function () {
  return gulp.src(sourceFiles)
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(['test/test-*.js'])
        .pipe(mocha({
          reporter: 'nyan'
        }))
        .pipe(istanbul.writeReports())
    })
})

gulp.task('test', gulp.series('clean', 'unittest'))

gulp.task('default', gulp.series('lint', 'test'))

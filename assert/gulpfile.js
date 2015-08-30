var gulp = require('gulp');
var uncss = require('gulp-uncss');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var clean = require('gulp-clean');

gulp.task('default', ['copyfonts', 'buildcss', 'buildjs'], function(){});

gulp.task('copyfonts', function(){
	gulp.src('./font/**/*')
		.pipe(gulp.dest('./dist/font'));
});

gulp.task('buildcss', function () {
  return gulp.src('./css/*.css')
    .pipe(uncss({
        html: ['templates/*.html']
    }))
    .pipe(concatCss("css/index.css"))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('buildjs', function(){
	return gulp.src('js/*.js')
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./dist/js'));
});

gulp.task('clean', function () {
  return gulp.src('./dist/*', {read: false})
    .pipe(clean());
});
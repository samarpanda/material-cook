var gulp = require('gulp');
var uncss = require('gulp-uncss');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('default', ['copyfonts', 'concatcss', 'buildjs', 'copyhtml'], function(){});

gulp.task('uncss', function () {
    return gulp.src('site.css')
        .pipe(uncss({
            html: ['index.html', 'posts/**/*.html', 'http://example.com']
        }))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('copyfonts', function(){
	gulp.src('./font/**/*')
		.pipe(gulp.dest('./dist/font'));
});

gulp.task('concatcss', function () {
  return gulp.src('css/*.css')
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

gulp.task('copyhtml', function(){
	return gulp.src('*.html')
		.pipe(gulp.dest('./dist'));
});


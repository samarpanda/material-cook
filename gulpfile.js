var gulp = require('gulp');
var uncss = require('gulp-uncss');
var concatCss = require('gulp-concat-css');

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
    .pipe(concatCss("styles/bundle.css"))
    .pipe(gulp.dest('out/'));
});

gulp.task('copyimg', function(){
	gulp.src('./images/')
});
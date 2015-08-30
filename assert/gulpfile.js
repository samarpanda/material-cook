var gulp = require('gulp');
var uncss = require('gulp-uncss');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var stripCSSComments = require('gulp-strip-css-comments');
var merge = require('merge2');

gulp.task('default', ['copyfonts','buildcss', 'buildjs'], function(){});

gulp.task('copyfonts', function () {
	gulp.src('./font/**/*')
		.pipe(gulp.dest('./dist/font'));
});

gulp.task('buildcss', function () {
  var main = gulp.src(['./css/*.css'])
        .pipe(uncss({
          html: ['templates/*.html'],
          ignore: [/hljs/],
        }));

  var codemirror = gulp.src(['./codemirror/lib/codemirror.css']);


  return merge(main, codemirror)
    .pipe(stripCSSComments())
    .pipe(concatCss('css/index.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('./dist'));
});

gulp.task('buildjs', function(){
	var allJS = gulp.src([
    './codemirror/lib/codemirror.js',
    './codemirror/mode/javascript/javascript.js',
    './test-runners/chai.js',
    './test-runners/sinon.js',
    './test-runners/sinon-chai.js',
    './js/*.js',
  ]);

  return allJS
  	.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./dist/js'));
});

gulp.task('watch', function () {
  return gulp
    .watch('./js/**/*.js', ['buildjs']);
});

gulp.task('clean', function () {
  return gulp.src('./dist/*', {read: false})
    .pipe(clean());
});

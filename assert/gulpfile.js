var gulp = require('gulp');
var uncss = require('gulp-uncss');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var stripCSSComments = require('gulp-strip-css-comments');
var merge = require('merge2');

gulp.task('default', ['copyfonts','buildcss','codemirror-js', 'buildjs'], function(){});

gulp.task('copyfonts', function(){
	gulp.src('./font/**/*')
		.pipe(gulp.dest('./dist/font'));
});

gulp.task('codemirror-js', function(){
  gulp.src(['./codemirror/lib/codemirror.js',
            './codemirror/mode/javascript/javascript.js',
           ])
    .pipe(concat('codemirror-build.js'))
    .pipe(gulp.dest('./js/'));
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

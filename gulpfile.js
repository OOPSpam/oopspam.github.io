var gulp = require('gulp'); 
var nunjucksRender = require('gulp-nunjucks-render');
var sitemap = require('gulp-sitemap');

gulp.task('build', function() {
    // Gets .html and .nunjucks files in pages
    return gulp.src('pages/**/*.+(html|nunjucks)')
    // Renders template with nunjucks
    .pipe(nunjucksRender({
        path: ['templates']
      }))
    // output files in app folder
    .pipe(gulp.dest('./'))
  });

  // Generate Sitemap.xml
gulp.task('sitemap', function() {
    var sources = [
      '*.html',
      './tools/*.html',
      './compare/*.html'
  ];
  return gulp.src(sources, { base: './' })
        .pipe(sitemap({
                siteUrl: 'https://www.oopspam.com'
        }))
        .pipe(gulp.dest('./'))
});
const gulp = require('gulp')
const $ = require('gulp-load-plugins')()

const imagesDir = 'src/images'

gulp.task('images', () =>
  gulp.src(`${imagesDir}/**/*`)
    .pipe(gulp.dest('public/images'))
)

const sassPaths = [
  'bower_components/normalize.scss/sass',
  'bower_components/foundation-sites/scss',
  'bower_components/motion-ui/src'
]

const stylesheetsDir = 'src/stylesheets'
const javascriptsDir = 'src/javascripts'

gulp.task('js', () =>
  gulp.src(`${javascriptsDir}/**/*`)
    .pipe(gulp.dest('public/javascripts'))
)

gulp.task('sass', () =>
  gulp.src(`${stylesheetsDir}/index.s*ss`)
    .pipe(
      $.sass({
        includePaths: sassPaths,
        outputStyle: 'compressed' // if css compressed **file size**
      })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('public/stylesheets'))
)

gulp.task('fonts', () =>
  gulp.src('./bower_components/components-font-awesome/fonts/**.*')
    .pipe(gulp.dest('public/fonts'))
)

gulp.task('watch-sass', ['sass'], () =>
  gulp.watch([`${stylesheetsDir}/**/*.scss`], ['sass'])
)

gulp.task('watch-js', ['sass'], () =>
  gulp.watch([`${javascriptsDir}/**/*.js`], ['js'])
)

function cleanTask (name, dir) {
  gulp.task(`clean-${name}`, () =>
    gulp.src(dir, {read: false})
      .pipe($.clean())
  )
}

cleanTask('js', 'public/javascripts/*')
cleanTask('sass', 'public/stylesheets/*')
cleanTask('images', 'public/images/*')
cleanTask('fonts', 'public/fonts/*')
cleanTask('transpiled', 'lib/*')

gulp.task('clean', ['clean-js', 'clean-sass', 'clean-images', 'clean-fonts', 'clean-transpiled'])

gulp.task('build', ['images', 'js', 'sass', 'fonts'])

gulp.task('default', ['build', 'watch-js', 'watch-sass'])
let gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer')

const DEST = 'build/';

const browserSync = require('browser-sync').create();

gulp.task('scripts', function() {
    return gulp.src([
        'src/js/helpers/*.js',
        'src/js/*.js',
      ])
      .pipe(concat('custom.js'))
      .pipe(gulp.dest(DEST+'/js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest(DEST+'/js'))
      .pipe(browserSync.stream());
});

// TODO: Maybe we can simplify how sass compile the minify and unminify version
let compileSASS = function (filename, options) {
  return sass('src/scss/*.scss', options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(DEST+'/css'))
        .pipe(browserSync.stream());
};

gulp.task('default', gulp.parallel('browser-sync', 'watch'));

gulp.task('sass', function() {
    return compileSASS('custom.css', {});
});

gulp.task('sass-minify', function() {
    return compileSASS('custom.min.css', {style: 'compressed'});
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './'
        },
        startPath: './production/index.html'
    });
});

gulp.task('another-task', gulp.series('browser-sync', function() {
    console.log('Running another-task');
}));

gulp.task('watch', function() {
  // Watch .html files
  gulp.watch('production/*.html', browserSync.reload);
  // Watch .js files
  gulp.watch('src/js/*.js', ['scripts']);
  // Watch .scss files
  gulp.watch('src/scss/*.scss', ['sass', 'sass-minify']);
});

// Task สำหรับ build โปรเจค
gulp.task('build', gulp.series('browser-sync', function(done) {
    // ตัวอย่างโค้ดสำหรับการ compile CSS ด้วย gulp-sass
    gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('build/css'));

    // ตัวอย่างโค้ดสำหรับการ minify JavaScript ด้วย Uglify
    gulp.src('src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('build/js'));


    done(); // บอก Gulp ว่า task เสร็จสิ้น
}));

// Task สำหรับ deploy โปรเจค
gulp.task('deploy', function(done) {
    gulp.src('build/**/*')
        .pipe(gulp.dest('deploy'));

    done(); // บอก Gulp ว่า task เสร็จสิ้น
});


// Default Task
gulp.task('default', gulp.series('browser-sync', 'watch'));
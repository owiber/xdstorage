module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      js: {
        src: [
          '<banner:meta.banner>',
          'src/LICENSE.txt',
          'src/intro.js',
          'lib/*.js',
          'src/setup.js',
          'src/client.js',
          'src/outro.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      },
      htm: {
        src: ['src/<%= pkg.name %>.htm'],
        dest: 'dist/<%= pkg.name %>.htm'
      }
    },
    uglify: {
      options: {
        preserveComments: 'some',
        report: 'min'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'src/setup.js', 'src/client.js'],
      options: {
        globals: {
          XDStorage: true,
          store: true,
          CryptoJS: true,
          easyXDM: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
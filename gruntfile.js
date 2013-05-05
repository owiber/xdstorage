module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      js: {
        src: [
          'src/LICENSE.txt',
          'dist/<%= pkg.name %>.min.js'
        ],
        dest: 'dist/<%= pkg.name %>.min.js'
      },
      htm: {
        src: ['src/<%= pkg.name %>.htm'],
        dest: 'dist/<%= pkg.name %>.htm'
      },
      demo: {
        src: ['src/demo.htm'],
        dest: 'dist/demo.htm'
      }
    },
    uglify: {
      options: {
        preserveComments: 'none',
        report: 'min'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= requirejs.compile.options.out %>']
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: "./src",
          out: "dist/xdstorage.js",
          name: "lib/almond",
          include: ['main'],
          optimize: 'none',
          paths: {
            lib: "../lib"
          },
          wrap: {
              start: "(function() {",
              end: "require('main'); }());"
          }
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'src/*.js'],
      options: {
        globals: {}
      }
    },
    clean: ['dist']
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', ['jshint', 'requirejs', 'uglify', 'concat']);

};
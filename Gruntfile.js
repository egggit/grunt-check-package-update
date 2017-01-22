/*
 * grunt-check-package-update
 * https://github.com/egggit/grunt-check-package-update
 *
 * Copyright (c) 2017 Egg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({

    // Make sure code styles are up to par
    jscs: {
      options: {
        config: '.jscsrc'
      },
      all: {
        src: [
          'Gruntfile.js',
          'tasks/*.js',
          // '<%= nodeunit.tests %>'
        ]
      },
    }, // jscs

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporterOutput: '',
      },
      all: {
        src: [
          'Gruntfile.js',
          'tasks/*.js',
          // '<%= nodeunit.tests %>'
        ]
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    'check_package_update': {
      all: {
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'check_package_update', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'jscs', 'test']);

};

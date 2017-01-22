/*
 * grunt-check-package-update
 * https://github.com/egggit/grunt-check-package-update
 *
 * Copyright (c) 2017 Egg
 * Licensed under the MIT license.
 */

'use strict';
var shell = require('shelljs');

module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('check_package_update', 'Check for private package updates for both npm and bower.', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = grunt.util._.extend({
        // file is in charge of master information, ie, it is it which define the base version to work on
        pathOfNPMPackage: grunt.config('pkgFile') || 'package.json',
        pathOfBowerPackage: 'bower.json',
        regexOfPrivateRepo: /^git\+.*$/,
        regexOfGitTag: /\.git#(.*)$/,
        regexOfGitWithoutTag: /^([^#]*)#.*$/,
      }, (grunt.config.data[this.name] ||  {}).options
    ); // options


    var addCurrentRepoTagToArrayOfRepo = function (arrayOfRepo) {
      if (typeof arrayOfRepo === 'undefined' || arrayOfRepo === null || arrayOfRepo.length === 0) {
        return;
      }

      for (var index = 0; index < arrayOfRepo.length; ++index) {
        var data = arrayOfRepo[index];
        var match = options.regexOfGitTag.exec(data.urlOfRepo);
        if (match.length > 1) {
          data.currentTag = match[1];
        }
      } // for (var index = 0; index

    }; // addCurrentRepoTagToArrayOfRepo

    var arrayOfPrivateRepoFromPackageInfo = function (packageInfo, nameOfPackageManager) {
      var result = [];
      if (typeof packageInfo === 'undefined' || packageInfo === null || packageInfo.length === 0) {
        return result;
      }

      for (var nameOfPackage in packageInfo) {
        if (packageInfo[nameOfPackage].match(options.regexOfPrivateRepo)) {
          result.push({
            nameOfPackage: nameOfPackage,
            urlOfRepo: packageInfo[nameOfPackage],
            packageManager: nameOfPackageManager
          });
        }
      }
      return result;
    }; // arrayOfPrivateRepoFromPackageInfo

    var arrayOfPrivateRepo = function () {
      var result = [];

      if (grunt.file.exists(options.pathOfNPMPackage) === true) {
        var npmPackageInfo = grunt.file.readJSON(options.pathOfNPMPackage);
        result = result.concat(arrayOfPrivateRepoFromPackageInfo(npmPackageInfo.dependencies, 'npm'));
        result = result.concat(arrayOfPrivateRepoFromPackageInfo(npmPackageInfo.devDependencies, 'npm'));
      }

      if (grunt.file.exists(options.pathOfBowerPackage) === true) {
        var bowerPackageInfo = grunt.file.readJSON(options.pathOfBowerPackage);
        result = result.concat(arrayOfPrivateRepoFromPackageInfo(bowerPackageInfo.dependencies, 'bower'));
        result = result.concat(arrayOfPrivateRepoFromPackageInfo(bowerPackageInfo.devDependencies, 'bower'));
      }

      return result;
    }; // arrayOfPrivateRepo

    var checkLatestTagWithArrayOfRepo = function (arrayOfRepo) {
      if (typeof arrayOfRepo === 'undefined' || arrayOfRepo === null || arrayOfRepo.length === 0) {
        return;
      }

      for (var index = 0; index < arrayOfRepo.length; ++index) {
        var data = arrayOfRepo[index];
        if (typeof data.currentTag === 'undefined' || data.currentTag === null) {
          continue;
        }

        var match = options.regexOfGitWithoutTag.exec(data.urlOfRepo);
        if (match === null || typeof match.length === 'undefined' || match.length < 1) {
          continue;
        }

        data.urlOfRepoWithoutTag = match[1];

        grunt.verbose.write('  Getting latest tag from repo: ' + data.urlOfRepoWithoutTag + '...');

        var command = 'git ls-remote -t ' + data.urlOfRepoWithoutTag + ' | sort -t \'/\' -k 3 -V | awk \'{print $2}\' | grep -v \'{}\' | awk -F"/" \'{print $3}\' | tail -n 1';
        var execResult = shell.exec(command, { silent: true});
        if (execResult.code !== 0 ||
            typeof execResult.output === 'undefined' || execResult.output === null) {
          continue;
        }

        data.latestTag = execResult.output.replace('\n', '');
        grunt.verbose.write('latest tag: ' + data.latestTag + '...').ok();

        if (data.latestTag !== data.currentTag) {
          grunt.log.subhead('** You can upgrade ' + data.packageManager + ': ' + data.nameOfPackage + ' ' + data.currentTag + ' -> ' + data.latestTag + ' (' + data.urlOfRepoWithoutTag + ')');
        }

      } // for (var index = 0; index

    }; // addCurrentRepoTagToArrayOfRepo

    var arrayOfRepo = arrayOfPrivateRepo();
    addCurrentRepoTagToArrayOfRepo(arrayOfRepo);
    checkLatestTagWithArrayOfRepo(arrayOfRepo);

  }); // grunt.registerMultiTask('check_package_update'

};

'use strict';

module.exports = function (grunt) {
  var localConfig;
  try {
    localConfig = require('./server/config/local.env');
  } catch(e) {
    localConfig = {};
  }

 // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn',
    protractor: 'grunt-protractor-runner',
    injector: 'grunt-asset-injector',
    buildcontrol: 'grunt-build-control',
    browserify: 'grunt-browserify'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    pkg: grunt.file.readJSON('package.json'),
    application: {
      client: 'client',
      styles: '<%= application.client %>/styles',
      scripts: '<%= application.client %>/scripts',
      views: '<%= application.client %>/views',
      dist: 'dist'
    },
    express: {
      options: {
        port: localConfig.PORT
      },
      dev: {
        options: {
          script: 'server/app.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: '<%= application.dist %>/server/app.js'
        }
      }
    },

    watch: {
      injectJS: {
        files: [
          '<%= application.scripts %>/**/*.js',
          '!<%= application.scripts %>/app.js'],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= application.styles %>/**/*.css'
        ],
        tasks: ['injector:css']
      },
      mochaTest: {
        files: ['server/test/**/*.js'],
        tasks: ['env:test', 'mochaTest']
      },
      jsTest: {
        files: [
          '<%= application.client %>/test/**/*.js'
        ],
        tasks: ['newer:jshint:all', 'karma']
      },
      injectSass: {
        files: [
          '<%= application.styles %>/**/*.{scss,sass}'],
        tasks: ['injector:sass']
      },
      sass: {
        files: [
          '<%= application.styles %>/**/*.{scss,sass}'],
        tasks: ['sass', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '.rebooted',
          '{.tmp,<%= application.client %>}/**/*.css',
          '{.tmp,<%= application.client %>}/views/**/*.html',
          '{.tmp,<%= application.client %>}/scripts/**/*.js',
          '{.tmp,<%= application.client %>}/**/*.json',
          '{.tmp,<%= application.client %>}/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= application.client %>}/bower_components/**/*'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '<%= application.client %>/.jshintrc',
        reporter: require('jshint-stylish')
      },
      server: {
        options: {
          jshintrc: 'server/.jshintrc'
        },
        src: [
          'server/**/*.js',
          '!server/**/*.spec.js'
        ]
      },
      serverTest: {
        options: {
          jshintrc: 'server/test/.jshintrc'
        },
        src: ['server/test/**/*.js']
      },
      all: [
        '<%= application.scripts %>/**/*.js'
      ],
      test: {
        src: [
          '<%= application.client %>/test/**/*.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= application.dist %>/*',
            '!<%= application.dist %>/.git*',
            '!<%= application.dist %>/.openshift',
            '!<%= application.dist %>/Procfile'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/'
        }]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server/app.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: localConfig.PORT
          },
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

              // refreshes browser when server reboots
            nodemon.on('restart', function () {
              // Delay before server listens on port
              setTimeout(function() {
                require('fs').writeFileSync('.rebooted', 'rebooted');
              }, 1000);
            });
          }
        }
      }
    },

   

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: '<%= application.client %>/index.html',
        ignorePath: '<%= application.client %>/',
        exclude: [/bootstrap-sass-official/, /bootstrap.js/, /json3/, /es5-shim/, /bootstrap.css/, /font-awesome.css/, /ionicons.css/, /chessboard.css/ ]
      },
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath:  /\.\.\//,
        fileTypes:{
          js: {
            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
              detect: {
                js: /'(.*\.js)'/gi
              },
              replace: {
                js: '\'{{filePath}}\','
              }
            }
          }
      },
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= application.dist %>/public/{,*/}*.js',
            '<%= application.dist %>/public/{,*/}*.css',
            '<%= application.dist %>/public/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= application.dist %>/public/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= application.client %>/index.html'],
      options: {
        dest: '<%= application.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= application.dist %>/public/{,*/}*.html'],
      css: ['<%= application.dist %>/public/{,*/}*.css'],
      js: ['<%= application.dist %>/public/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= application.dist %>/public',
          '<%= application.dist %>/public/images'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= application.client %>/images',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= application.dist %>/public/images'
        }]
      }
    },

     svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= application.client %>/images',
          src: '**/*.svg',
          dest: '<%= application.dist %>/public/images'
        }]
      }
    },


    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '**/*.js',
          dest: '.tmp/concat'
        }]
      }
    },

    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: 'openingChessApp',
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        usemin: 'scripts/app.js'
      },
      main: {
        cwd: '<%= application.views %>',
        src: ['**/*.html'],
        dest: '.tmp/templates.js'
      },
      tmp: {
        cwd: '.tmp',
        src: ['views/**/*.html'],
        dest: '.tmp/tmp-templates.js'
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= application.dist %>/public/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= application.client %>',
          dest: '<%= application.dist %>/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'images/**/*.{webp}',
            'fonts/**/*',
            'languages/**/*',
            'index.html'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= application.dist %>/public/images',
          src: ['generated/*']
        }, {
          expand: true,
          dest: '<%= application.dist %>',
          src: [
            'package.json',
            'server/**/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= application.styles %>',
        dest: '.tmp/',
        src: ['./**/*.css']
      }
    },

    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        connectCommits: false,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      heroku: {
        options: {
          remote: 'heroku',
          branch: 'master'
        }
      },
      openshift: {
        options: {
          remote: 'openshift',
          branch: 'master'
        }
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'sass',
      ],
      test: [
        'sass',
      ],
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'sass',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'client/test/karma.conf.js',
        singleRun: true
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['server/test/**/*.js']
    },

    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      chrome: {
        options: {
          args: {
            browser: 'chrome'
          }
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      },
      all: localConfig
    },

    // Compiles Sass to CSS
    sass: {
      server: {
        options: {
          loadPath: [
            '<%= application.client %>/bower_components',
          ],
          compass: false
        },
        files: {
          '.tmp/styles/app.css' : '<%= application.styles %>/app.scss'
        }
      }
    },

    injector: {
      options: {

      },
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= application.client %>/index.html': [
              ['{.tmp,<%= application.scripts %>}/**/*.js',
               '!{.tmp,<%= application.scripts %>}/app.js',
               '!{.tmp,<%= application.scripts %>}/routes.js'
              ]
            ]
        }
      },

      // Inject component scss into app.scss
      sass: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/styles/', '');
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          '<%= application.styles %>/app.scss': [
            '<%= application.styles %>/**/*.{scss,sass}',
            '!<%= application.styles %>/app.{scss,sass}'
          ]
        }
      },

      // Inject component css into index.html
      css: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= application.client %>/index.html': [
            '<%= application.styles %>/**/*.css'
          ]
        }
      }
    },
  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'env:all', 'env:prod', 'express:prod', 'wait', 'express-keepalive']);
    }

    if (target === 'debug') {
      grunt.task.run([
        'clean:server',
        'env:all',
        'injector:sass',
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
        'concurrent:debug'
      ]);
    } else {
      grunt.task.run([
        'clean:server',
        'env:all',
        'injector:sass',
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'wait',
        'watch'
      ]);
    }
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', function(target) {
    if (target === 'server') {
      return grunt.task.run([
        'env:all',
        'env:test',
        'mochaTest'
      ]);
    }

    else if (target === 'client') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'injector:sass',
        'concurrent:test',
        'injector',
        'autoprefixer',
        'karma'
      ]);
    }

    else if (target === 'e2e') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'env:test',
        'injector:sass',
        'concurrent:test',
        'injector',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'protractor'
      ]);
    }

    else grunt.task.run([
      'test:server',
      'test:client'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'injector:sass',
    'concurrent:dist',
    'injector',
    'wiredep',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};

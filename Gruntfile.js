 module.exports = function(grunt) {
 
  "use strict";

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    
    pkg: grunt.file.readJSON('package.json'),
        
    banner: 
      '/*!\n' +
      ' * <%= pkg.name %> v<%= pkg.version %>\n' +
      ' * <%= pkg.url %>\n' +
      ' * Licensed under <%= pkg.licenses %>\n' +
      ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
      ' * <%= pkg.authorUrl %>\n' +
      ' */\n',
    // ====================================================
    clean: {
      files: [
        '<%= pkg.dist %>',
        '<%= pkg.source %>/fonts',
        '<%= pkg.public %>'
      ]
    },
    
    // ====================================================
    webfont: {
      source: {
        src: '<%= pkg.source %>/svg/*.svg',
        dest: '<%= pkg.source %>/fonts',
        destCss:'<%= pkg.source %>',
        options: {
          engine: 'node',
          font: '<%= pkg.name %>',
          stylesheet: 'less',
          relativeFontPath: '../fonts/',
          syntax: 'bem',
          hashes:false,
          destHtml:'<%= pkg.source %>',
          
          htmlDemoName:'index',　//勝手に追加したオプション1
          cssName:'webfont',      //勝手に追加したオプション2
          
          // htmlDemoTemplate:'<%= pkg.source %>/webfont/template.html',
          // template: 'my_templates/tmpl.css',
          templateOptions: {
            baseClass: 'qcon',
            classPrefix: 'qcon-',
            mixinPrefix: 'qcon-'
          }
        }
      },
    },    
    
    // ====================================================
    less:{
      source: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: ['<%= pkg.name %>.css.map'],
          sourceMapFilename: '<%= pkg.source %>/css/<%= pkg.name %>.css.map'
        },
        files: {
          '<%= pkg.source %>/css/<%= pkg.name %>.css': '<%= pkg.source %>/less/<%= pkg.name %>.less'
        } 
      },
      minify: {
        options: {
          cleancss: true
        },
        files: {
          '<%= pkg.source %>/css/<%= pkg.name %>.min.css': '<%= pkg.source %>/css/<%= pkg.name %>.css'
        }
      }
    },
    // ====================================================
    autoprefixer: {
      options: {
        browsers: ['last 2 versions', 'ie 8', 'ie 9', 'android 2.3', 'android 4', 'opera 12']
      },
      source: {
        options: {
          map: true
        },
        src: '<%= pkg.source %>/css/<%= pkg.name %>.css'
      }
    },
    // ====================================================
    csscomb: {
      options: {
        config: '<%= pkg.source %>/less/.csscomb.json'
      },
      source: {
        expand: true,
        cwd: '<%= pkg.source %>/css/',
        src: ['*.css', '!*.min.css'],
        dest: '<%= pkg.source %>/css/'
      }
    },    
    // ====================================================
    usebanner: {
      options: {
        position: 'top',
        banner: '<%= banner %>'
      },
      source: {
        src: '<%= pkg.source %>/css/*.css'
      }
    },
    // ====================================================
    csslint: {
      options: {
        csslintrc: '<%= pkg.source %>/less/.csslintrc'
      },
      source: [
        '<%= pkg.source %>/css/<%= pkg.name %>.css'
      ]
    },
    // ====================================================
    copy: {
      dist: {
        expand: true,
        cwd: './<%= pkg.source %>',
        src: [
          'fonts/*.eot',
          'fonts/*.svg',
          'fonts/*.ttf',
          'fonts/*.woff',
          'css/*.css',
          'css/*.map'
        ],
        dest: './<%= pkg.dist %>'
      },
      public: {
        expand: true,
        cwd: './<%= pkg.source %>',
        src: [
          'index.html',
          'fonts/*.eot',
          'fonts/*.svg',
          'fonts/*.ttf',
          'fonts/*.woff'
        ],
        dest: './<%= pkg.public %>'
      }
    },
    // ====================================================
    connect: {
      server: {
        options: {
          port: 9999,
          hostname: '0.0.0.0',
          base: '<%= pkg.public %>',
          open: {
            server: {
              path: 'http://<%= connect.server.options.hostname %>:<%= connect.server.options.port %>/<%= pkg.name %>.html'
            }
          }
        }
      }
    },
    // ====================================================
    notify: {
      options: {
        title: '<%= pkg.name %> Grunt Notify',
      },
      success:{
        options: {
          message: 'Success!',
        }
      }
    },
    // ====================================================
    bower: {
      install: {
        options: {
          targetDir: '<%= pkg.source %>/vendor',
          layout: 'byComponent',
          install: true,
          verbose: false,
          cleanTargetDir: true,
          cleanBowerDir: false
        }
      }
    },
    // ====================================================
    jekyll: {
      dist: {
        options: {
          config: '_config.yml'
        }
      }
    },
    // ====================================================
    watch: {
      options: {
        spawn: false,
        livereload : true
      },
      html: {
        files: [
          '<%= pkg.source %>/*.html'
        ],
        tasks: [
          'copy',
          'notify'
        ]
      },
      less: {
        files: [
          '<%= pkg.source %>/less/*.less',
          '<%= pkg.source %>/less/**/*.less'
        ],
        tasks: [
          'build-less',
          'copy',
          'notify'
        ]
      },
      svg: {
        files: [
          '<%= pkg.source %>/svg/*.svg'
        ],
        tasks: [
          'webfont',
          'copy',
          'notify'
        ]
      }
    },
    // ====================================================
    buildcontrol: {
      options: {
        dir: '<%= pkg.public %>',
        commit: true,
        push: true,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: 'git@github.com:<%= pkg.repository.user %>/<%= pkg.name %>.git',
          branch: 'gh-pages'
        }
      }
    }        
     
  });

  //publicに指定したディレクトリをgh-pagesブランチにデプロイ。
  // ====================================================
  grunt.registerTask('deploy', [
    'buildcontrol',
    'notify'
  ]);

  // lessコンパイル
  // ====================================================
  grunt.registerTask('build-less', [
    'less:source', 
    'autoprefixer:source', 
    'usebanner', 
    'csscomb:source', 
    'less:minify',
  ]);
  
  // jekyllコンパイル
  // ====================================================
  grunt.registerTask('build-html', [
    // 'jekyll',
    //'htmlmin'
  ]);

  // font書き出し
  // ====================================================
  grunt.registerTask('font', [
    'webfont',
    'build-less'
  ]);
  
  // font書き出し
  // ====================================================
  grunt.registerTask('f', [
    'webfont',
    'build-less',
    'default'
  ]);
  
  // ベンダーファイルのインストール →　コンパイル　→　テスト　→　ウォッチ
  // ====================================================
  grunt.registerTask('b', [
    'clean',
    // 'bower',
    'webfont',
    'build-less',
    // 'build-html',
    'copy',
    'default'
  ]);
  
  // サーバー起動　→　ウオッチ
  // ====================================================
  grunt.registerTask('default', function () {
    grunt.log.warn('`grunt` to start a watch.');
    grunt.task.run([
      'connect',
      'watch'
    ]);
  });
    
};
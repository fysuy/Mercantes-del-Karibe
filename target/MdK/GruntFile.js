module.exports = function (grunt) {  
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);  
    
  // Project configuration.  
  grunt.initConfig({  
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 
        'js/app.js', 
        'js/map.js',
        'js/ships.js',
        'js/webSocket.js'
      ],
      options: {
        reporter: require('jshint-stylish'),
        force: true,
        globals: {
          jQuery: true
        } 
      }
    },
    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'css/styles.css': 'css/styles.scss'
        }
      }
    }
  });  

  grunt.registerTask('default', ['jshint', 'sass']);
};
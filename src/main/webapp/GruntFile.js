module.exports = function (grunt) {  
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);  
    // Project configuration.  
    grunt.initConfig({  
        pkg: grunt.file.readJSON('package.json'),  
        sass: {
			options: {
				sourceMap: true
			},
			dist: {
				files: {
					'scss/styles.css': 'scss/styles.scss'
				}
			}
		},
        cssmin: {  
            sitecss: {  
                options: {  
                    banner: '/* Mercantes-del-Karibe minified css file */'  
                },  
                files: {  
                    'css/common.min.css': [
                    	'bower_components/bootstrap/dist/css/bootstrap.min.css',
                    	'scss/styles.css'
                    ]  
                }  
            }  
        },  
        uglify: {  
            options: {  
                compress: true  
            },  
            applib: {  
                src: [  
                'bower_components/jquery/dist/jquery.min.js',  
                'bower_components/snap.svg/dist/snap.svg-min.js',
                'bower_components/bootstrap/dist/js/bootstrap.min.js'
                ],  
                dest: 'js/common.js'  
            }  
        }  
    });  
    // Default task.  
    grunt.registerTask('default', ['sass','uglify', 'cssmin']);  
};
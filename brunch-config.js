exports.config = {
    files: {
        javascripts: {
            defaultExtension: 'js',
            joinTo: {
                'scripts/spot.js': /^app/,
                'scripts/vendor.js': /^bower_components/,
            }
        },

        stylesheets: {
            defaultExtension: 'styl',
            joinTo: {
                'styles/spot.css': /^app/,
                'styles/vendor.css': /^bower_components/
            },
            order: {
                before: [
                    'app/styles/phlex-grid.styl'
                ]
            }
        },

        templates: {
            joinTo: {
                'scripts/template.js': /^app\/views\//
            }
        }
    },

    server: {
        port: 8000,
        run: true
    },

    plugins: {
        html2js: {
            options: {
                base: 'app/views'
            }
        },

        stylus: {
            plugins: ['nib', 'jeet', 'rupture', 'axis']
        }
    }
};

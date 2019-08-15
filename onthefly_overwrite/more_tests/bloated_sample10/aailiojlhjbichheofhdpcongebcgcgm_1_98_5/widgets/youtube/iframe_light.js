/*
    Light switch widget
*/

(function() {
    'use strict';

    var widget = {

        name: 'Lights for iframe',

        initialize: function() {
            switch(window.location.host.replace('www.', '')) {
                case 'heartbeat--43483.onmodulus.net':
                    this.file_css = 'lightsout-chat';
                    break;
                case 'google.com':
                    this.file_css = 'lightsout-google';
                    break;
            }

            this.render();
        },

        render: function() {
            if (!this.file_css) {
                return;
            }

            this.set_dark_mode();
        },

        set_dark_mode: function () {
            var css = document.getElementById(this.file_css);

            if (!settings.lights && !css) {
                css = jsonToDOM(['link', {
                    rel: 'stylesheet',
                    href: config.assets_url + 'styles/' + this.file_css + '.css',
                    id: this.file_css
                }]);
                (document.head || document.body || document.documentElement).appendChild(css);
            } 
            else if (settings.lights && css) {
                css.parentElement.removeChild(css);
            }
        },

        settings_changed: function(change) {
            if (change.lights) {
                this.render();
            }
        },

        integrity: function() {
            var css = util.$('#' + this.file_css);

            return !this.file_css || (settings.lights && !css) || (!settings.lights && css);
        }
    };

    widgets.push(widget);

})();

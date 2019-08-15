/*
    Light switch widget
*/

(function() {
    'use strict';

    var widget = {

        name: 'Lights',

        initialize: function() {
            this.render();
            this.ensure_dark_mode();
        },

        render: function() {
            this.set_dark_mode(document);
        },

        ensure_dark_mode: function () {
            var that = this;

            if (this.interval) {
                return;
            }

            this.interval = setInterval(function () {
                that.dark_mode_for_iframe('google-feedback-wizard');
            }, 500);
        },

        dark_mode_for_iframe: function (frame_id) {
            var iframe = util.$('#' + frame_id);

            if (!iframe) {
                return;
            }

            this.set_dark_mode(iframe.contentDocument);
        },

        set_dark_mode: function (doc) {
            var yt = location.host === 'www.youtube.com',
                css = doc.getElementById('hbeat_light_css');

            if (!settings.lights && !css) {
                css = jsonToDOM(['link', {
                    rel: 'stylesheet',
                    href: config.assets_url + 'styles/lightsout' + (yt ? '' : '-comment') + '.css',
                    id: 'hbeat_light_css'
                }]);
                (doc.head || doc.body || doc.documentElement).appendChild(css);
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
            var css = util.$('#hbeat_light_css');

            return (settings.lights && !css) || (!settings.lights && css);
        }
    };

    // widgets.push(widget);

})();

/*
    Light switch widget
*/

(function () {
    'use strict';

    var widget = {

        name: 'Light switch',

        container: '#heartbeat_light_switch',

        initialize: function () {
            widget.light_switch = jsonToDOM(
                ['img', 
                    {
                        id: this.container.slice(1),
                        src: config.assets_url + (settings.lights ? 'on' : 'off') + '.png',
                        class: (settings.lights ? 'on' : 'off') + ' yt-uix-tooltip yt-uix-tooltip-reverse',
                        'data-tooltip-text': util.light_switch_text(),
                        onclick: widget.toggle_lights
                    }
                ]);

            widget.dark_css = jsonToDOM(['link', {
                    id: 'heartbeat_dark_css',
                    rel: 'stylesheet',
                    href: config.assets_url + 'styles/youtube-darkmode.css'
                }]);

            this.ensure_dark_mode();
        },

        start: function () {
            if (!settings.light_switch) {
                return;
            }

            util.$wait('#heartbeat_light_switch_place_holder', function (err, ele) {
                if (!err && ele) {
                    if (!util.$(widget.container)) {
                        ele.replace(widget.light_switch);
                    }
                }
            });

            widget.render();
        },

        toggle_lights: function () {
            util.$('#heartbeat_light_switch').src = config.assets_url + (!settings.lights ? 'on' : 'off') + '.png';
            settings.set('lights', !settings.lights);
        },

        render: function () {
            var css = util.$('#heartbeat_dark_css');

            if (!settings.lights && !css) {
                (document.head || document.body || document.documentElement).appendChild(widget.dark_css);
                return;
            } 
            
            if (settings.lights && css) {
                css.remove();
            }
        },

        stop: function () {
            widget.light_switch.remove();
            widget.dark_css.remove();
        },

        settings_changed: function (change) {
            if (change.light_switch) {
                settings.light_switch ? widget.start() : widget.stop();
            }
            else if (change.lights) {
                widget.render();
            }
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

            this.toggle_dark_mode(iframe.contentDocument);
        },

        toggle_dark_mode: function (doc) {
            var yt = location.host === 'www.youtube.com',
                css = doc.getElementById('hbeat_light_css');

            if (!settings.lights && !css) {
                css = jsonToDOM(['link', {
                    rel: 'stylesheet',
                    href: config.assets_url + 'styles/lightsout.css',
                    id: 'hbeat_light_css'
                }]);
                (doc.head || doc.body || doc.documentElement).appendChild(css);
            } 
            else if (settings.lights && css) {
                css.parentElement.removeChild(css);
            }
        }
    };

    // widgets.push(widget);

})();

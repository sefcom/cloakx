/*
    Light switch widget for Twitch
*/

(function () {
    'use strict';

    var widget = {

        name: 'Twitch Lights',

        initialize: function () {

            this._switch = jsonToDOM(
                ['img', {
                    src: config.assets_url + (settings.twitch_lights ? 'on' : 'off') + '.png',
                    id: 'heartbeat_twitch_light_switch',
                    class: (settings.twitch_lights ? 'on' : 'off'),
                    title: util.locale('dark_mode')
                }]
            );

            this.dark_css = jsonToDOM(['link', {
                    rel: 'stylesheet',
                    href: config.assets_url + 'twitch-dmode.css',
                    id: 'hbeat_light_css'
                }]);

            if (settings.twitch_dark_mode) {
                this.render();
                this.render_css();
                this.dark_switch_listen();
            } 
        },

        render: function () {
            var that = this;

            if (!settings.twitch_dark_mode) {
                return;
            }

            util.$wait('.channel-stats', function (err, ele) {
                if (!err && ele) {
                    ele = ele[0];
                    ele.appendChild(that._switch);
                }
            });
        },

        settings_changed: function (change) {
            if (change.twitch_dark_mode) {
                if (!settings.twitch_dark_mode) {
                    this._switch.remove();
                    this.dark_css.remove();
                }
                else {
                    this.render();
                    this.render_css();
                }
            }
        },

        render_css: function () {
            if (!settings.twitch_lights) {
                (document.head || document.body || document.documentElement).appendChild(this.dark_css);
            }
            else {
                this.dark_css.remove();
            }
        },

        dark_switch_listen: function () {
            var that = this;

            this._switch.addEventListener('click', function () {
                settings.set('twitch_lights', !settings.twitch_lights);
                that._switch.src = config.assets_url + (settings.twitch_lights ? 'on' : 'off') + '.png';
                that._switch.className = (settings.twitch_lights ? 'on' : 'off');
                that.render_css();
            });
        }
    };

    widgets.push(widget);
})();

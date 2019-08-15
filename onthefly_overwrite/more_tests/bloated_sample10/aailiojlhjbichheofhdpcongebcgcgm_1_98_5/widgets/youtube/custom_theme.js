(function () {
    'use strict';

    var widget = {

        name: 'Youtube Custom Theme',

        initialize: function () {
            util.wait_for(
                function () { return settings; },
                function () {
                    widget.less_css = ['link', {
                        id: 'youtube_theme_css',
                        type: 'text/css',
                        rel: 'stylesheet',
                        href: theme_helper.get_css_link('youtube')
                    }];

                    widget.color_switch = jsonToDOM(
                        ['img', {
                                id: 'youtube_theme_switch',
                                src: config.assets_url + (settings.youtube_theme ? 'on-1' : 'off-1') + '.png',
                                class: (settings.youtube_theme ? 'on' : 'off') + ' yt-uix-tooltip yt-uix-tooltip-reverse',
                                'data-tooltip-text': 'custom theme',
                                onclick: widget.toggle_color
                            }
                        ]
                    );

                    widget.start();
                }
            );
        },

        toggle_color: function () {
            util.$('#youtube_theme_switch').src = config.assets_url + (!settings.youtube_theme ? 'on-1' : 'off-1') + '.png';
            settings.set('youtube_theme', !settings.youtube_theme);
        },

        start: function () {
            util.$wait('#heartbeat_color_switch_place_holder', function (err, ele) {
                if (!err && ele) {
                    if (!util.$('#youtube_theme_switch')) {
                        ele.replace(widget.color_switch);
                    }
                }
            });

            if (!settings.youtube_theme) return;

            util.$wait('head', function (err, eles) {
                if (err  || util.$('#youtube_theme_css')) return;

                eles[0].append_child(widget.less_css);
            });
        },

        stop: function () {
            var current_theme = util.$('#youtube_theme_css');

            if (current_theme) {
                current_theme.remove();
            }
        },

        settings_changed: function (change) {
            if (change.youtube_theme_last_update) {
                util.$('#youtube_theme_css').href = theme_helper.get_css_link('youtube', {
                    _t: settings.youtube_theme_last_update
                });
            }
            else if (change.youtube_theme) {
                settings.youtube_theme ? widget.start() : widget.stop();
            }
        }
    };

    widgets.push(widget);

})();

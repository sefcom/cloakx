/*
    Utilities
*/
(function (root) {
    'use strict';

    root.theme_helper = {

        variables: [
            // global
            'text_color',
            'background_color',
            'border_color',

            // video title
            'video_link_text_color',
            'video_link_hover_color',
            'video_link_visited_color',

            // body
            'body_background_image',
            'body_background_color',

            // button
            'button_background_color',
            'button_border_color',
            'button_text_color',

            // input
            'input_background_color',
            'input_border_color',
            'input_text_color'
        ],

        default_themes: {
            dark: {
                // global
                text_color: '#C2C2C2',
                background_color: '#1b1b1b',
                border_color: '#999999',

                // video title
                video_link_text_color: '#999999',
                video_link_hover_color: 'lighten(#999, 10%)',
                video_link_visited_color: '',

                // body
                body_background_image: null,
                body_background_color: '#000000',

                // button
                button_background_color: '#3c3c3c',
                button_border_color: '#999999',
                button_text_color: '#999999',

                // input
                input_background_color: '#111111',
                input_border_color: '#2b2b2b',
                input_text_color: '#aaaaaa'
            },
            red: {
                // global
                text_color: '#eeeeee',
                background_color: '#f34541',
                border_color: '#ffffff',

                // video title
                video_link_text_color: '#eee',
                video_link_hover_color: '#d5d5d5',
                video_link_visited_color: '#d5d5d5',

                // body
                body_background_image: null,
                body_background_color: '#d32f2f',

                // button
                button_background_color: '#c62828',
                button_border_color: '#eeeeee',
                button_text_color: '#eeeeee',

                // input
                input_background_color: '#d32f2f',
                input_border_color: '#eeeeee',
                input_text_color: '#eeeeee'
            },
            blue: {
                // global
                text_color: '#eeeeee',
                background_color: '#1976d2',
                border_color: '#ffffff',

                // video title
                video_link_text_color: '#eeeeee',
                video_link_hover_color: '#d5d5d5',
                video_link_visited_color: '#d5d5d5',

                // body
                body_background_image: null,
                body_background_color: '#0d47a1',

                // button
                button_background_color: '#1565c0',
                button_border_color: '#eeeeee',
                button_text_color: '#eeeeee',

                // input
                input_background_color: '#0d47a1',
                input_border_color: '#eeeeee',
                input_text_color: '#eeeeee'
            },
            cyan: {
                // global
                text_color: '#ffffff',
                background_color: '#00acc1',
                border_color: '#ffffff',

                // video title
                video_link_text_color: '#7cf2ff',
                video_link_hover_color: '#aff7ff',
                video_link_visited_color: '#aff7ff',

                // body
                body_background_image: null,
                body_background_color: '#00838f',

                // button
                button_background_color: '#00838f',
                button_border_color: '#ffffff',
                button_text_color: '#ffffff',

                // input
                input_background_color: '#00838f',
                input_border_color: '#ffffff',
                input_text_color: '#ffffff'
            },
            green: {
                // global
                text_color: '#ffffff',
                background_color: '#00897b',
                border_color: '#ffffff',

                // video title
                video_link_text_color: '#00FFE1',
                video_link_hover_color: '#33ffe7',
                video_link_visited_color: '#00ccb4',

                // body
                body_background_image: null,
                body_background_color: '#00695c',

                // button
                button_background_color: '#00796b',
                button_border_color: '#ffffff',
                button_text_color: '#ffffff',

                // input
                input_background_color: '#00796b',
                input_border_color: '#ffffff',
                input_text_color: '#ffffff'
            }
        },

        get_uuid: function (platform) {
            var uuid = settings[platform + '_theme_uuid'];

            if (!uuid) {
                uuid = util.generate_UUID().replace(/-/g, '');
                settings.set(platform + '_theme_uuid', uuid);
            }

            return uuid;
        },

        set_mode: function (platform, mode, callback) {
            settings[platform + '_theme_mode'] = mode;
            settings.save(callback);
        },

        get_mode: function (platform) {
            return settings[platform + '_theme_mode'] || 'dark';
        },

        get_css_link: function (platform, params) {
            return '//s3.amazonaws.com/heartbeat.asset/theme/' + platform + '/' +
                this.get_uuid(platform) + '.css?' + (params ? util.stringify(params) : '');
        },

        set_settings: function (platform, variables, callback) {
            _(variables)
                .forEach(function (color, item) {
                    var set_key = platform + '_theme_' + item,
                        set_key_enable = set_key + '_enable';

                    settings[set_key] = color;
                    settings[set_key_enable] = !!color;
                })
                .commit();

            settings.save(callback);
        },

        get_settings: function (platform, mode) {
            var variables = {};
                mode = mode || this.get_mode(platform);

            if (mode === 'custom') {
                _(this.variables)
                    .forEach(function (item) {
                        var color = settings[platform + '_theme_' + item],
                            is_enabled = settings[platform + '_theme_' + item + '_enable'];

                        variables[item] = is_enabled && color || null;
                    })
                    .commit();
            }
            else {
                variables = theme_helper.default_themes[mode];
            }

            return variables;
        },

        recompile: function (platform, callback) {
            util.api('theme')('upload')
                .post({
                    uuid: this.get_uuid(platform),
                    platform: platform,
                    variables: this.get_settings(platform)
                }, callback || _.noop);
        }
    }

})(this);

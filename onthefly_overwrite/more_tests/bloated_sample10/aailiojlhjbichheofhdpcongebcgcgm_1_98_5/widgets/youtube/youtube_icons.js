(function() {

    'use strict';

    var widget = {

        name: 'youtube icons',

        initialize: function() {
            this.place_holders = jsonToDOM(['div', {id: 'youtube_icon_placeholders'},
                // ['div', {class: 'place_holder', id: 'heartbeat_light_switch_place_holder'}],
                ['div', {class: 'place_holder', id: 'heartbeat_color_switch_place_holder'}],
                ['div', {class: 'place_holder', id: 'freedom_watch_later_icon_place_holder'}],
                ['div', {class: 'place_holder', id: 'freedom_video_manager_icon_place_holder'}],
                ['div', {class: 'place_holder', id: 'freedom_all_comments_icon_place_holder'}],
                ['div', {class: 'place_holder', id: 'freedom_analytics_icon_place_holder'}],
                ['div', {class: 'place_holder', id: 'annotation_tool_container_place_holder'}],
                ['div', {class: 'place_holder', id: 'heartbeat_settings_place_holder'}]
            ]);

            this.watch_later = jsonToDOM(
                ['a', {
                        id: 'freedom_watch_later_icon',
                        href: 'https://www.youtube.com/playlist?list=WL',
                        class: 'yt-uix-tooltip yt-uix-tooltip-reverse freedom_one_click_a',
                        'data-tooltip-text': util.locale('watch_later')
                    },
                    ['img', {
                        src: config.assets_url + 'watch_later.png',
                        class: 'freedom_one_click_icon'
                    }]
                ]
            );

            this.video_manager = jsonToDOM(
                ['a', {
                        id: 'freedom_video_manager_icon',
                        href: 'https://www.youtube.com/my_videos',
                        class: 'yt-uix-tooltip yt-uix-tooltip-reverse freedom_one_click_a',
                        'data-tooltip-text': util.locale('video_manager')
                    },
                    ['img', {
                        src: config.assets_url + 'video-manager.png',
                        class: 'freedom_one_click_icon'
                    }]
                ]
            );

            this.community = jsonToDOM(
                ['a', {
                        id: 'freedom_all_comments_icon',
                        href: 'https://www.youtube.com/comments' + (settings.spam_comments
                            ? '?filter=all&highlights=False&tab=spam'
                            : ''),
                        class: 'yt-uix-tooltip yt-uix-tooltip-reverse freedom_one_click_a',
                        'data-tooltip-text': util.comments_text()
                    },
                    ['img', {
                        src: config.assets_url + 'community.png',
                        class: 'freedom_one_click_icon'
                    }]
                ]
            );

            this.analytics = jsonToDOM(
                ['a', {
                        id: 'freedom_analytics_icon',
                        href: settings.realtime_analytics
                            ? 'https://www.youtube.com/analytics#r=realtime'
                            : 'https://www.youtube.com/analytics',
                        class: 'yt-uix-tooltip yt-uix-tooltip-reverse freedom_one_click_a',
                        'data-tooltip-text': util.analytics_text(),
                    },
                    ['img', {
                        src: config.assets_url + 'analytics.png',
                        class: 'freedom_one_click_icon'
                    }]
                ]
            );

            this.render();
        },

        toggle_display: function (icon, visible) {
            var mast = util.$('#yt-masthead-user') || util.$('#yt-masthead-signin'),
                icon_dom = util.$('#' + icon.getAttribute('id')),
                place_holder = util.$('#' + icon.getAttribute('id') + '_place_holder');

            if (!place_holder) {
                return;
            }

            if (visible && !icon_dom) {
                place_holder.replace(icon);
                return;
            }

            if (!visible && icon_dom) {
                icon_dom.remove();
            }
        },

        render: function() {
            var mast = util.$('#yt-masthead-user') || util.$('#yt-masthead-signin');

            if (!mast) {
                return;
            }

            if (!util.$('#youtube_icon_placeholders')) {
                mast.insertBefore(this.place_holders, mast.firstElementChild);
                return;
            }


            this.toggle_display(this.watch_later, settings.show_watch_later);

            this.toggle_display(this.video_manager, settings.show_video_manager);

            this.toggle_display(this.analytics, settings.show_analytics);

            this.toggle_display(this.community, settings.show_comments);
        },

        settings_changed: function(change) {
            if (change.show_watch_later) {
                this.toggle_display(this.watch_later, settings.show_watch_later);
            }

            if (change.show_video_manager) {
                this.toggle_display(this.video_manager, settings.show_video_manager);
            }

            if (change.show_analytics) {
                this.toggle_display(this.analytics, settings.show_analytics);
            }

            if (change.show_comments) {
                this.toggle_display(this.community, settings.show_comments);
            }
        },

        integrity: function() {
            return (settings.show_watch_later && util.$('#freedom_watch_later_icon')) &&
                (settings.show_video_manager && util.$('#freedom_video_manager_icon')) &&
                (settings.show_analytics && util.$('#freedom_analytics_icon')) &&
                (settings.show_comments && util.$('#freedom_all_comments_icon'));
        }
    };

    widgets.push(widget);

})();

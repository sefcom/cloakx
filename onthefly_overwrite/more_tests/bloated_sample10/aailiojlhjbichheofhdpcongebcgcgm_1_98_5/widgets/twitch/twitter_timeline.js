(function () {
    'use strict';

    var widget = {
        name: 'Twitter timeline',

        widget_selector: '#freedom_social_tabs',
        twitter_timeline_selector: '#freedom_twitter_timeline_tab',
        youtube_rss_selector: '#freedom_youtube_rss_tab',

        initialize: function () {
            this.widget_tabs = jsonToDOM(
                ['div', {id: 'freedom_social_tabs'},
                    ['ul',
                        ['li', {
                                class: 'freedom_social_tab selected',
                                'data-target': 'freedom_chat_tab'
                            },
                            util.locale('chat')
                        ],
                        ['li', {
                                class: 'freedom_social_tab',
                                'data-target': 'freedom_twitter_timeline_tab'
                            },
                            util.locale('Twitter')
                        ],
                        ['li', {
                                class: 'freedom_social_tab',
                                'data-target': 'freedom_youtube_rss_tab'
                            },
                            util.locale('YouTube')
                        ]
                    ]
                ]
            );

            this.twitter_timeline = jsonToDOM(['div', {
                id: 'freedom_twitter_timeline_tab',
                class: 'freedom_social_tab_pane'
            }]);

            this.youtube_rss = jsonToDOM(['div', {
                id: 'freedom_youtube_rss_tab',
                class: 'freedom_social_tab_pane'
            }]);

            this.add_event_handlers();
        },

        start: function () {
            if (!settings.twitch_social_feed) {
                return;
            }

            this.render();
        },

        settings_changed: function (change) {
            if (!change.twitch_social_feed || !change.twitch_social_feed.newValue) {
                this.remove();
            }
        },

        render: function () {
            var right_content = util.$('#right_col .rightcol-content')[0],
                tab_container = util.$('#right_col .tab-container')[0],
                chat_tab = util.$('#right_col .chat-container')[0];

            if (!right_content || !tab_container || !util.$('#channel')) {
                return;
            }

            this.remove();

            if (chat_tab) {
                chat_tab.setAttribute('id', 'freedom_chat_tab');
                chat_tab.add_class('freedom_social_tab_pane');
                chat_tab.add_class('selected');

                right_content.appendChild(this.widget_tabs);
                tab_container.appendChild(this.twitter_timeline);
                tab_container.appendChild(this.youtube_rss);
            }
        },

        remove: function () {
            var chat_tab = util.$('#right_col .chat-container')[0];

            if (chat_tab) {
                chat_tab.removeAttribute('id');
                chat_tab.remove_class('freedom_social_tab_pane');
                chat_tab.remove_class('selected');
            }

            if (util.$(this.widget_selector)) {
                this.widget_tabs.remove();
            }

            if (util.$(this.twitter_timeline_selector)) {
                this.twitter_timeline.remove();
            }

            if (util.$(this.youtube_rss_selector)) {
                this.youtube_rss.remove();
            }
        },

        integrity: function () {
            return util.$(this.widget_selector) &&
                util.$(this.twitter_timeline_selector) &&
                util.$(this.youtube_rss_selector);
        },

        add_event_handlers: function () {
            var that = this;

            util.$('li', this.widget_tabs).forEach(function (li) {
                li.addEventListener('click', that.on_tab_selected);
            });
        },

        on_tab_selected: function (evt) {
            var li = evt.srcElement,
                tab_container = util.$('#right_col .tab-container')[0],
                target = li.getAttribute('data-target');

            // tab thumb show/hide
            util.$('li.selected', this.widget_tabs).forEach(function (selected) {
                selected.remove_class('selected');
            });
            li.add_class('selected');

            // tab panel show/hide
            util.$('.freedom_social_tab_pane.selected', tab_container).forEach(function (selected) {
                selected.remove_class('selected');
            });
            util.$('#' + target).add_class('selected');
            // tab logic
            switch (target) {
                case 'freedom_twitter_timeline_tab':
                    this.load_twitter_timeline();
                    break;
                case 'freedom_youtube_rss_tab':
                    this.load_youtube_rss();
                    break;
            }
        },

        load_twitter_timeline: function () {
            var twitter_iframe = util.$('#freedom_twitter_timeline_iframe', this.twitter_timeline),
                width = this.twitter_timeline.offsetWidth,
                height = this.twitter_timeline.offsetHeight - 20,
                screen_name = this.find_social_name('twitter.com'),
                url = config.server_ip_add + '/twitch/twitter_timeline?';

            if (!screen_name) {
                screen_name = 'twitch';
            }

            url += 'screen_name=' + screen_name +
                '&width=' + width + '&height=' + height;

            if (!twitter_iframe) {
                twitter_iframe = jsonToDOM(['iframe', {
                    id: 'freedom_twitter_timeline_iframe',
                    src: url
                }]);
                this.twitter_timeline.appendChild(twitter_iframe);
            }
        },

        load_youtube_rss: function () {
            var that = this,
                user_name = this.find_social_name('youtube.com');

            if (!user_name) {
                user_name = 'twitch';
            }

            util.api('user_activities')
                ({user_name: user_name})
                .get(function (err, result) {
                    if (err || !result || !result.items) return;

                    that.render_rss_feed(result.items);
                });
        },

        render_rss_feed: function (entries) {
            var that = this,
                rss_dom = ['div', {
                    width: this.twitter_timeline.offsetWidth + 'px',
                    height: (this.twitter_timeline.offsetHeight - 20) + 'px',
                    id: 'freedom_feed_container',
                    class: 'freedom_feed_container'
                }];

            if (util.$('#freedom_feed_container', this.youtube_rss)) {
                // loaded
                return;
            }

            entries.forEach(function (entry) {
                var img = entry.snippet ? entry.snippet.thumbnails.default : null,
                    link = that.get_youtube_video_link(entry),
                    description = entry.snippet
                        ? that.shorten_text(entry.snippet.description, 100)
                        : '',
                    title = entry.snippet ? entry.snippet.title : null;

                if (!img || !title) return;

                rss_dom.push(['div', {class: 'freedom_feed_item'},
                    ['div', {class: 'freedom_feed_item_title'},
                        ['div', {class: 'video_img'},
                            ['a', {
                                    href: link,
                                    target: '_blank'
                                },
                                ['img', {
                                    width: img.width,
                                    height: img.height,
                                    src: img.url
                                }]
                            ]
                        ],
                        ['div', {
                                class: 'video_title',
                                style: 'margin-left:' + (img.width + 10) + 'px'
                            },
                            ['a', {
                                    href: link,
                                    target: '_blank'
                                },
                                title],
                            ['p', description]
                        ]
                    ]
                ]);
            });

            this.youtube_rss.appendChild(jsonToDOM(rss_dom));
        },

        shorten_text: function (text, max_len) {
            var need_trimmed = text && text.length > max_len,
                trimmed,
                words;

            if (need_trimmed) {
                trimmed = text.substr(0, max_len);
                words = trimmed.split(/\s/);
                if (words.length > 1) {
                    words = words.slice(0, words.length - 2);
                }

                return words.join(' ').trim() + '...';
            }

            return text;
        },

        get_youtube_video_link: function (entry) {
            var video_link = 'https://www.youtube.com/watch?v=',
                entry_type = entry.snippet.type;

            switch (entry_type) {
            case 'upload':
                video_link += entry.contentDetails.upload.videoId + '&hb=twitch_timeline';
                break;
            default:
                video_link += entry.contentDetails[entry_type].resourceId.videoId + '&hb=twitch_timeline';
                break;
            }

            return video_link;
        },

        find_social_link: function (social_domain) {
            // social_domain: twitter.com, yotube.com, facebook.com
            var profile_text = '',
                url_reg = new RegExp('\\b(https?)://(www\.)?' + social_domain + '/[A-Z0-9+&@#%=~_|!:,.;]+(?![\/\?])\\b', 'ig'),
                link = '',
                links = util.$('div#channel a[href*="' + social_domain + '/"]');

            // scan all hyperlinks contain domain name and match the pattern
            if (links.length) {
                links.forEach(function (lnk) {
                    if (url_reg.test(lnk.getAttribute('href'))) {
                        link = lnk.getAttribute('href');
                    }
                });
            }

            if (!link) {
                // parse inner text to see if it contains the pattern
                profile_text = util.$('#channel').innerText;
                links = profile_text.match(url_reg);
                if (links && links.length) {
                    link = links[0];
                }
            }

            return link;
        },


        find_social_name: function (social_domain) {
            //social_domain: twitter.com, yotube.com, facebook.com
            var link = this.find_social_link(social_domain),
                link_parts = link ? link.split('/') : [];

            if (link_parts.length > 0) {
                return link_parts[link_parts.length - 1];
            }

            return '';
        }
    };

    widgets.push(widget);
})();

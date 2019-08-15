(function () {

    'use strict';

    var widget = {

        name: 'Sort suggested videos',
        videos: [],
        sort_value: 'sort_by_default',

        initialize: function () {
            var that = this;

            if (this.widget_dom) {
                return;
            }

            this.widget_dom = jsonToDOM(['div', {id: 'freedom_sort_videos'},
                ['div',
                    ['button', {
                            id: 'freedom_sort_videos_button',
                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default',
                            onclick: this.show_popup
                        },
                        ['i', {class: 'fa fa-filter'}],
                        ['span', util.locale('sort_videos')]
                    ],
                    ['button', {
                            id: 'freedom_sort_direction_button',
                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default',
                            onclick: this.on_change_sort_direction
                        },
                        ['i', {class: 'fa fa-sort-desc'}],
                        ['i', {class: 'fa fa-sort-asc'}]
                    ],
                    ['div', {
                            id: 'freedom_video_sort_options',
                            class: 'yt-uix-button-menu yt-uix-button-menu-default',
                        },
                        ['ul', {
                                class: 'yt-uix-kbd-nav yt-uix-kbd-nav-list'
                            },
                            ['li', {
                                    'data-value': 'sort_by_views',
                                    'data-text': util.locale('sort_by_views'),
                                    onclick: this.sort_by_views
                                },
                                ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_views')]
                            ],
                            ['li', {
                                    'data-value': 'sort_by_duration',
                                    'data-text': util.locale('sort_by_time'),
                                    onclick: this.sort_by_duration
                                },
                                ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_time')]
                            ],
                            ['li', {class: 'sep'}],
                            ['li', {
                                    'data-value': 'sort_by_default',
                                    'data-text': util.locale('sort_by_default'),
                                    onclick: this.sort_by_default
                                },
                                ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_default')]
                            ]
                        ]
                    ]
                ]
            ]);
        },

        start: function () {
            if (!~location.pathname.indexOf('/watch')) {
                this.remove();
                return;
            }

            if (util.parse_qs().v !== this.video_id) {
                this.reset_ui();
            }

            this.extract_videos();
            if (this.sort_value !== 'sort_by_default') {
                this[this.sort_value]();
            }

            this.render();
        },

        remove: function () {
            var widget = util.$('#freedom_sort_videos');

            if (widget) {
                widget.remove();
            }
        },

        render: function () {
            var related_watch = util.$('#watch-related');

            this.remove();

            if (!related_watch) {
                return;
            }

            related_watch.parentElement.insertBefore(this.widget_dom, related_watch);
        },

        extract_videos: function () {
            var that = this,
                index = util.$('#watch-related .video-list-item[freedom_index]').length;

            _(util.$('#watch-related .video-list-item'))
                .forEach(function (li) {
                    var lnk = util.$('.content-link', li)[0],
                        video_time = util.$('.video-time', li)[0],
                        view_count = util.$('.view-count', li)[0],
                        video_id = lnk && lnk.getAttribute('href').replace('/watch?v=', '');

                    if (li.getAttribute('freedom_index')) {
                        return;
                    }

                    li.setAttribute('freedom_index', index);
                    video_time = video_time ? util.hms_to_seconds(_(video_time.innerText.split(' ')).last()) : 0;
                    view_count = view_count ? parseInt(_(view_count.innerText.split(' ')).first().replace(/,/g, '')) : 0;

                    that.videos.push({
                        index: index++,
                        video_id: video_id,
                        duration: isFinite(video_time) ? video_time : 0,
                        views: isFinite(view_count) ? view_count : 0,
                        li: li
                    });
                })
                .commit();
        },

        integrity: function() {
            return util.parse_qs().v === this.video_id
                && this.videos.length === util.$('#watch-related .video-list-item').length
                && util.$('#freedom_sort_videos');
        },

        reset_ui: function () {
            this.video_id = util.parse_qs().v;
            this.set_sort_value('sort_by_default', util.locale('sort_videos'));
            this.videos = [];
        },

        show_popup: function (evt) {
            evt.stopPropagation();

            util.$('#freedom_video_sort_options', this.widget_dom).add_class('show');
            document.addEventListener('click', this.hide_popup);
        },

        hide_popup: function () {
            util.$('#freedom_video_sort_options', this.widget_dom).remove_class('show');
            document.removeEventListener('click', this.hide_popup);
        },

        sort_videos: function (predicate) {
            var ul = util.$('#watch-related'),
                load_more = util.$('#watch-more-related-button'),
                lis;

            this.videos.sort(predicate);

            lis = _(this.videos)
                .map(function (v) {
                    return v ? v.li : null; 
                })
                .filter()
                .value();

            _(lis)
                .forEach(function (li) {
                    if (load_more) {
                        ul.insertBefore(li, load_more);
                    }
                    else {
                        ul.appendChild(li);
                    }
                })
                .commit();
        },

        sort_by_views: function (evt) {
            var that = this;

            this.set_sort_value(
                'sort_by_views', 
                util.locale('sort_by_views'), 
                this.sort_direction || 'desc'
            );

            this.sort_videos(function (l, r) {
                var cmp = l.views - r.views;

                return that.sort_direction === 'asc' ? cmp : -cmp;
            });
        },

        sort_by_duration: function (evt) {
            var that = this;

            this.set_sort_value(
                'sort_by_duration', 
                util.locale('sort_by_time'), 
                this.sort_direction || 'desc'
            );

            this.sort_videos(function (l, r) {
                var cmp = l.duration - r.duration;

                return that.sort_direction === 'asc' ? cmp : -cmp;
            });
        },

        sort_by_default: function () {
            var that = this;

            this.set_sort_value('sort_by_default', util.locale('sort_videos'));

            this.sort_videos(function (l, r) {
                return l.index - r.index;
            });
        },

        set_sort_value: function (value, text, dir) {
            var btn = util.$('#freedom_sort_videos_button span', this.widget_dom)[0],
                btn_dir = util.$('#freedom_sort_direction_button', this.widget_dom);

            this.sort_value = value;
            this.sort_direction = dir;

            btn.innerText = text;
            btn_dir.remove_class('asc').remove_class('desc');
            if (dir) {
                btn_dir.add_class(dir);
            }
        },

        on_change_sort_direction: function (evt) {
            var btn = util.bind_elem_functions(evt.target);

            btn.toggle_class('asc').toggle_class('desc');

            this.sort_direction = this.sort_direction === 'asc' ? 'desc' : 'asc';

            if (this.sort_value) {
                this[this.sort_value]();
            }
        }
    };

    widgets.push(widget);

})();


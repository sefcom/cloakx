(function () {
    'use strict';

    var widget = {
        name: 'Playlist sorting',

        videos: [],
        video_map: {},
        sort_by: '',
        sort_dir: null,

        container: '#freedom_video_table_header',
        popup_menu_selector: '#freedom_playlist_sort_options',

        initialize: function () {
            this.widget_dom = jsonToDOM(['thead',
                ['tr', {
                        id: 'freedom_video_table_header',
                        class: 'pl-video yt-uix-tile'
                    },
                    ['td', {class: 'pl-video-handle'}],
                    ['td', {class: 'pl-video-index'}],
                    ['td', {class: 'pl-video-thumbnail'}],
                    ['td', {class: 'pl-video-title'}],
                    ['td', {class: 'pl-video-badges'}],
                    ['td', {
                            id: 'sort_by_default',
                            class: 'header_col sort_by_default'
                        },
                        ['span', {
                                class: 'header_col_title pl-video-added-by',
                                style: 'visibility:hidden'
                            },
                            util.locale('sort_by_default')
                        ]
                    ],
                    ['td', {
                            class: 'header_col sort_by_views freedom_pl_video_statistics',
                            'data-sort-by': 'sort_by_views'
                        },
                        ['div', {
                                class: 'yt-uix-tooltip',
                                'data-tooltip-text': util.locale('sort_by_views')
                            },
                            ['span', {class: 'header_col_title'}],
                            ['span', {class: 'header_col_sort_handle'}]
                        ]
                    ],
                    ['td', {
                            class: 'header_col sort_by_likes freedom_pl_video_statistics',
                            'data-sort-by': 'sort_by_likes'
                        },
                        ['div', {
                                class: 'yt-uix-tooltip',
                                'data-tooltip-text': util.locale('sort_by_likes')
                            },
                            ['span', {class: 'header_col_title'}],
                            ['span', {class: 'header_col_sort_handle'}]
                        ]
                    ],
                    ['td', {
                            class: 'header_col sort_by_dislikes freedom_pl_video_statistics',
                            'data-sort-by': 'sort_by_dislikes'
                        },
                        ['div', {
                                class: 'yt-uix-tooltip',
                                'data-tooltip-text': util.locale('sort_by_dislikes')
                            },
                            ['span', {class: 'header_col_title'}],
                            ['span', {class: 'header_col_sort_handle'}]
                        ]
                    ],
                    ['td', {
                            class: 'header_col sort_by_comments freedom_pl_video_statistics',
                            'data-sort-by': 'sort_by_comments'
                        },
                        ['div', {
                                class: 'yt-uix-tooltip',
                                'data-tooltip-text': util.locale('sort_by_comments')
                            },
                            ['span', {class: 'header_col_title'}],
                            ['span', {class: 'header_col_sort_handle'}]
                        ]
                    ],
                    ['td', {
                            class: 'header_col freedom_pl_video_statistics sm_visible',
                            style: 'padding-right: 0px'
                        },
                        ['div', {id: 'freedom_playlist_sort'},
                            ['button', {
                                id: 'freedom_playlist_sort_button',
                                'data-tooltip-text': util.locale('select_sort_option'),
                                class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default yt-uix-button-has-icon no-icon-markup yt-uix-tooltip'
                            }],
                            ['button', {
                                id: 'freedom_playlist_sort_direction_button',
                                class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default yt-uix-button-has-icon no-icon-markup'
                            }],
                            ['div', {
                                    id: 'freedom_playlist_sort_options',
                                    class: 'yt-uix-button-menu yt-uix-button-menu-default',
                                    style: 'display: none'
                                },
                                ['ul', {
                                        class: 'yt-uix-kbd-nav yt-uix-kbd-nav-list',
                                        'tabindex': '0'
                                    },
                                    ['li', {
                                            'data-value': 'sort_by_views',
                                            'data-text': util.locale('sort_by_views')
                                        },
                                        ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_views')]
                                    ],
                                    ['li', {
                                            'data-value': 'sort_by_likes',
                                            'data-text': util.locale('sort_by_likes')
                                        },
                                        ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_likes')]
                                    ],
                                    ['li', {
                                            'data-value': 'sort_by_dislikes',
                                            'data-text': util.locale('sort_by_dislikes')
                                        },
                                        ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_dislikes')]
                                    ],
                                    ['li', {
                                            'data-value': 'sort_by_views',
                                            'data-text': util.locale('sort_by_views')
                                        },
                                        ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_views')]
                                    ],
                                    ['li', {
                                            'data-value': 'sort_by_comments',
                                            'data-text': util.locale('sort_by_comments')
                                        },
                                        ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_comments')]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    ['td', {
                            class: 'header_col sort_by_time freedom_pl_video_statistics pl-video-time',
                            'data-sort-by': 'sort_by_time'
                        },
                        ['div', {
                                class: 'yt-uix-tooltip',
                                'data-tooltip-text': util.locale('sort_by_time')
                            },
                            ['span', {class: 'header_col_title fa fa-lg fa-clock-o'}],
                            ['span', {class: 'header_col_sort_handle'}]
                        ]
                    ]
                ]
            ]);

            this.attach_event_handlers();
        },

        start: function () {
            if (settings.sort_playlist && !util.$('#playlist-add-video-form')) {
                this.load_video_statistics(this.render);
            }
        },

        remove: function () {
            var elem = util.$(this.container);
            if (elem) {
                elem.parentElement.removeChild(elem);
                util.$('#pl-video-table').remove_class('has_statistics_column');
                util.$('.freedom_pl_video_statistics').forEach(function (td) {
                    td.remove();
                });

                this.sort_by = 'sort_by_item_number';
                this.sort_dir = true;
                this.refresh_sorting();
            }
        },

        render: function () {
            var pl_wrapper = util.$('#pl-video-list'),
                tbl_playlist = util.$('#pl-video-table');

            this.remove();

            if (pl_wrapper && tbl_playlist) {
                tbl_playlist.insertBefore(this.widget_dom, tbl_playlist
                    .firstElementChild);

                tbl_playlist = util.$('#pl-video-table');
                tbl_playlist.add_class('has_statistics_column');

                // handle click more button when playlist has more than 100 items
                this.set_item_number();
                this.bind_load_more_event();
            }
        },

        settings_changed: function (change) {
            if (!change.sort_playlist || !change.sort_playlist.newValue) {
                this.remove();
            }
        },

        integrity: function () {
            return util.$(this.container);
        },

        set_item_number: function () {
            var tbl_playlist = util.$('#pl-video-table'),
                tbl_playlist_items = util.$('.pl-video[data-item-number]', tbl_playlist),
                index = tbl_playlist_items.length;

            tbl_playlist_items = util.$('.pl-video:not([data-item-number])', tbl_playlist);
            tbl_playlist_items.forEach(function (tbl_playlist_item) {
                // row index is equal to item number at firstime view loaded
                // but after sorting by other options, it somehow changed
                // need to store it
                tbl_playlist_item.setAttribute('data-item-number', index);
                index += 1;
            });
        },

        bind_load_more_event: function () {
            var btn_load_more = util.$('.browse-items-load-more-button');
            if (btn_load_more.length > 0) {
                btn_load_more = btn_load_more[0];
                btn_load_more.removeEventListener('click', this.on_load_more_videos);
                btn_load_more.addEventListener('click', this.on_load_more_videos);
            }
        },

        on_load_more_videos: function () {
            // when playlist have more than 100 items
            var that = this,
                interval,
                loading_icon = util.$('.browse-items-load-more-button .load-more-loading');

            if (loading_icon.length > 0) {
                loading_icon = loading_icon[0];
                interval = setInterval(function () {
                    if (loading_icon.has_class('hid')) {
                        // when ajax completed
                        clearInterval(interval);
                        // set item number for new loaded item
                        that.set_item_number();
                        that.load_video_statistics(that.refresh_sorting);
                        // sometimes the button is re-created => we lost all event handlers bind to it
                        that.bind_load_more_event();
                    }
                }, 500);
            }
        },

        collect_video_ids: function () {
            var item_rows = util.$('table#pl-video-table .pl-video'),
                video_ids = [];

            item_rows.forEach(function (row) {
                video_ids.push(row.getAttribute('data-video-id'));
            });

            return video_ids;
        },

        render_video_statistics: function (items) {
            var that = this;
            items.forEach(function (item) {
                var tr = util.$('table#pl-video-table .pl-video[data-video-id="' + item.id + '"]'),
                    stat_tds,
                    tds,
                    last_col;

                if (!tr || tr.length === 0) {
                    return;
                }

                tr = tr[0];

                // remove existing if any
                stat_tds = util.$('.freedom_pl_video_statistics', tr);
                stat_tds.forEach(function (td) {
                    td.remove();
                });

                // add new column before last column
                tds = util.$('td', tr);
                last_col = tds[tds.length - 1];
                tr.insertBefore(that.create_stat_td_dom('sort_by_views', item.statistics.viewCount),
                    last_col);
                tr.insertBefore(that.create_stat_td_dom('sort_by_likes', item.statistics.likeCount),
                    last_col);
                tr.insertBefore(that.create_stat_td_dom('sort_by_dislikes', item.statistics.dislikeCount),
                    last_col);
                tr.insertBefore(that.create_stat_td_dom('sort_by_comments', item.statistics.commentCount),
                    last_col);
                tr.insertBefore(that.create_stat_small_td_dom(item), last_col);
            });
        },

        create_stat_td_dom: function (stat_name, stat_value) {
            var stat_dom = jsonToDOM(['td', {class: 'freedom_pl_video_statistics hight_lightable ' + stat_name},
                ['div', {class: 'more-menu-wrapper freedom_video_stat ' + stat_name},
                    stat_value.toLocaleString()
                ]
            ]);

            return stat_dom;
        },

        create_stat_small_td_dom: function (item) {
            var stat_dom = jsonToDOM(
                ['td', {class: 'freedom_pl_video_statistics sm_visible'},
                    ['div', {class: 'freedom_video_stat sort_by_views hight_lightable'},
                        ['span', {class: 'count'}, item.statistics.viewCount.toLocaleString()],
                        ['span', util.locale('views')]
                    ],
                    ['div', {class: 'freedom_video_stat'},
                        ['span', {
                                class: 'count sort_by_likes hight_lightable',
                                style: 'margin-right: 0'
                            }, item.statistics.likeCount.toLocaleString()],
                        ['span', '/'],
                        ['span', {class: 'count sort_by_dislikes hight_lightable'},
                            item.statistics.dislikeCount.toLocaleString()],
                        ['span', {class: 'sort_by_likes hight_lightable'}, util.locale('likes')],
                        ['span', '/'],
                        ['span', {class: 'sort_by_dislikes hight_lightable'}, util.locale('dislikes')]
                    ],
                    ['div', {class: 'freedom_video_stat sort_by_comments hight_lightable'},
                        ['span', {class: 'count'}, item.statistics.commentCount.toLocaleString()],
                        ['span', util.locale('comments')]
                    ]
                ]
            );

            return stat_dom;
        },

        build_video_id_mapping: function () {
            // for quicker sorting
            var that = this;
            this.video_map = {};
            this.videos.forEach(function (item) {
                that.video_map[item.id] = item;
            });
        },

        format_video_item: function (item) {
            item.statistics.likeCount = parseInt(item.statistics.likeCount);
            item.statistics.dislikeCount = parseInt(item.statistics.dislikeCount);
            item.statistics.viewCount = parseInt(item.statistics.viewCount);
            item.statistics.commentCount = parseInt(item.statistics.commentCount);
        },

        load_video_statistics: function (callback) {
            var that = this,
                video_ids = this.collect_video_ids(),
                page_size = 50,
                start = 0,
                end = Math.min(page_size, video_ids.length),
                s_video_id,
                sub_array,
                req = 0,
                res = 0;

            that.videos.length = 0;

            while (start < end) {
                sub_array = video_ids.slice(start, end);
                s_video_id = sub_array.join(',');
                req += 1;

                util.api('get_statistics')({video_id: s_video_id})
                    .get(video_stat_loaded);

                start = end;
                end = Math.min(end + page_size, video_ids.length);
            }

            function video_stat_loaded(err, result) {
                if (err) return;

                // format result
                result.items.forEach(that.format_video_item);
                that.videos = that.videos.concat(result.items);

                that.render_video_statistics(result.items);

                res += 1;

                if (req === res) {
                    that.build_video_id_mapping();

                    if (callback) {
                        callback();
                    }
                }
            }
        },

        sort_playlist: function (predicate) {
            var tbl = util.$('#pl-video-table'),
                trs = util.$('tbody .pl-video', tbl);

            trs.sort(predicate);

            trs.forEach(function (tr) {
                util.$('tbody', tbl)[0].appendChild(tr);
            });
        },

        get_playlist_item_video: function (pl_row) {
            // get video item attached with tr element for sorting
            // need to handle deleted video as well, it still a playlist item but no info
            var video_id = pl_row ? pl_row.getAttribute('data-video-id') : '';
            return this.video_map[video_id] || {
                id: video_id,
                itemNumber: pl_row.getAttribute('data-item-number'),
                statistics: {
                    likeCount: 0,
                    dislikeCount: 0,
                    viewCount: 0,
                    commentCount: 0
                }
            };
        },

        sort_by_item_number: function (sort_dir) {
            this.sort_playlist(function (l, r) {
                var left = parseInt(l.getAttribute('data-item-number')),
                    right = parseInt(r.getAttribute('data-item-number')),
                    cmp = left - right;

                return sort_dir ? cmp : -cmp;
            });
        },

        sort_by_likes: function (sort_dir) {
            var that = this;
            this.sort_playlist(function (l, r) {
                var left = that.get_playlist_item_video(l),
                    right = that.get_playlist_item_video(r),
                    cmp = left.statistics.likeCount - right.statistics.likeCount;

                return sort_dir ? cmp : -cmp;
            });
        },

        sort_by_dislikes: function (sort_dir) {
            var that = this;
            this.sort_playlist(function (l, r) {
                var left = that.get_playlist_item_video(l),
                    right = that.get_playlist_item_video(r),
                    cmp = left.statistics.dislikeCount - right.statistics.dislikeCount;

                return sort_dir ? cmp : -cmp;
            });
        },

        sort_by_views: function (sort_dir) {
            var that = this;
            this.sort_playlist(function (l, r) {
                var left = that.get_playlist_item_video(l),
                    right = that.get_playlist_item_video(r),
                    cmp = left.statistics.viewCount - right.statistics.viewCount;

                return sort_dir ? cmp : -cmp;
            });
        },

        sort_by_comments: function (sort_dir) {
            var that = this;
            this.sort_playlist(function (l, r) {
                var left = that.get_playlist_item_video(l),
                    right = that.get_playlist_item_video(r),
                    cmp = left.statistics.commentCount - right.statistics.commentCount;

                return sort_dir ? cmp : -cmp;
            });
        },

        sort_by_time: function (sort_dir) {
            this.sort_playlist(function (l, r) {
                var cmp;

                l = l.getElementsByClassName('timestamp')[0];
                r = r.getElementsByClassName('timestamp')[0];

                // private videos don't have a time
                try {
                    cmp = l.textContent.replace(/:/g, '') - r.textContent.replace(/:/g, '');
                    return sort_dir ? cmp : -cmp;
                }
                catch (e) {
                    // sort private videos to the bottom
                    return l ? -1 : 1;
                }
            });
        },

        refresh_sorting: function () {
            var sort_dir_button = util.$('#freedom_playlist_sort_direction_button'),
                sorting_col = util.$('.header_col[data-sort-by=' + this.sort_by + ']', this.widget_dom),
                default_sort_button = util.$('#sort_by_default', this.widget_dom);

            this[this.sort_by](this.sort_dir);

            // hightlight current sort criteria in every playlist item row
            util.$('.hight_lightable.high_lighted').forEach(function (stat) {
                stat.remove_class('high_lighted');
            });
            util.$('.hight_lightable.' + this.sort_by).forEach(function (stat) {
                stat.add_class('high_lighted');
            });

            // update style of sort direction button
            if (this.sort_by !== 'sort_by_item_number' && this.sort_by !== 'sort_by_time' && sort_dir_button) {
                if (this.sort_dir) {
                    sort_dir_button.remove_class('desc');
                    sort_dir_button.add_class('asc');
                }
                else {
                    sort_dir_button.add_class('desc');
                    sort_dir_button.remove_class('asc');
                }
            }
            else if (sort_dir_button) {
                sort_dir_button.remove_class('desc');
                sort_dir_button.remove_class('asc');
            }


            // update style of table header
            this.clear_sorting_header(sorting_col);
            if (sorting_col.length) {
                sorting_col = sorting_col[0];
                if (this.sort_dir) {
                    sorting_col.remove_class('desc');
                    sorting_col.add_class('asc');
                }
                else {
                    sorting_col.remove_class('asc');
                    sorting_col.add_class('desc');
                }
            }

            // show/hide sort by default button
            if (this.sort_by !== 'sort_by_item_number') {
                default_sort_button.firstElementChild.style.visibility = 'visible';
            }
            else if (default_sort_button) {
                default_sort_button.firstElementChild.style.visibility = 'hidden';
            }
        },

        attach_event_handlers: function () {
            var that = this;

            // sorting event handlers
            util.$('.header_col[data-sort-by]', this.widget_dom).forEach(function (col) {
                col.addEventListener('click', that.on_column_sorting);
            });

            util.$('#sort_by_default', this.widget_dom).addEventListener('click', function () {
                that.sort_by = 'sort_by_item_number';
                that.sort_dir = true;
                that.refresh_sorting();
            });

            // click filter button will show popup menu
            util.$('#freedom_playlist_sort_button', this.widget_dom).addEventListener('click',
                function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();

                    util.$(that.popup_menu_selector, that.widget_dom).style.display = 'block';
                    // click outside will close the popup
                    setTimeout(function () {
                        document.addEventListener('click', that.close_popup_menu);
                    }, 0);
                });

            // click on sort option list
            util.$('div#freedom_playlist_sort_options li', this.widget_dom).forEach(function (li) {
                li.addEventListener('click', that.on_select_sort_option);
            });

            // click sot direction button
            util.$('#freedom_playlist_sort_direction_button', this.widget_dom).addEventListener('click',
                function () {
                    // sort option not selected yet
                    if (!that.sort_by ||
                        that.sort_by === 'sort_by_item_number' ||
                        that.sort_by === 'sort_by_time') {
                        that.sort_by = 'sort_by_likes';
                        that.sort_dir = true;
                    }

                    // re-sort playlist
                    that.sort_dir = !that.sort_dir;
                    that.refresh_sorting();
                });
        },

        close_popup_menu: function () {
            var popup = util.$(this.popup_menu_selector);
            if (popup) {
                util.$(this.popup_menu_selector).style.display = 'none';
                document.removeEventListener('click', this.close_save_popup);
            }
        },

        on_column_sorting: function (evt) {
            var sorting_col = evt.currentTarget,
                sort_dir = true;

            if (sorting_col.has_class('desc')) {
                sort_dir = false;
            }

            this.trigger_sorting(sorting_col.getAttribute('data-sort-by'), !sort_dir);
        },

        on_select_sort_option: function (evt) {
            var li = evt.currentTarget,
                sort_by = li.getAttribute('data-value');

            this.trigger_sorting(sort_by);
        },

        clear_sorting_header: function (soting_col) {
            util.$('.header_col[data-sort-by]', this.widget_dom).forEach(function (col) {
                if (col !== soting_col) {
                    col.remove_class('asc');
                    col.remove_class('desc');
                }
            });
        },

        trigger_sorting: function (sort_by, sort_dir) {
            this.sort_by = sort_by;

            if (sort_dir !== undefined) {
                // not provided
                this.sort_dir = sort_dir;
            }

            if (this.sort_dir === null) {
                // sort descending by default
                this.sort_dir = false;
            }

            this.refresh_sorting();

            window.scrollTo(window.scrollX, window.scrollY - 1);
            window.scrollTo(window.scrollX, window.scrollY + 2);
        }
    };

    widgets.push(widget);

})();


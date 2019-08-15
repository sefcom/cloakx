/*
    @@name Stats line widget
    @@contains
        views per day
        views per month
        subscribers per day
        total videos
*/

(function () {
    'use strict';

    var widget = {

        name: 'Stats line',
        container: '#freedom_spd_vpd_div',

        prev_id: null,
        daily_stats: null,

        initialize: function () {
            if (!~['watch', 'channel'].indexOf(data.page) || this.line) {
                return;
            }

            this.line = jsonToDOM(['div', {id: this.container.slice(1)},
                ['span', {
                    id: 'freedom_vpm',
                    style: settings.vpm ? '' : 'display:none'
                }],
                ['span', {
                    id: 'freedom_vpd',
                    style: settings.vpd ? '' : 'display:none'
                }],
                ['span', {
                    id: 'freedom_vph',
                    style: settings.vph ? '' : 'display:none'
                }],
                ['span', {
                    id: 'freedom_spm',
                    style: settings.spm ? '' : 'display:none'
                }],
                ['span', {
                    id: 'freedom_spd',
                    style: settings.spd ? '' : 'display:none'
                }],
                ['span', {
                    id: 'freedom_sph',
                    style: settings.sph ? '' : 'display:none'
                }],
                ['span', {
                    id: 'freedom_videos',
                    style: settings.videos ? '' : 'display:none'
                }],
                ['span', {
                        id: 'freedom_channel_identifier',
                        style: settings.channel_identifier ? '' : 'display:none'
                    },
                    ['br'],
                    ['span', {id: 'freedom_channel_id_span'},
                        ['b',
                            'Channel ID: ',
                            ['a', {id: 'freedom_channel_id'}]
                        ]
                    ],
                    ['span', {id: 'freedom_channel_username_span'},
                        ['b',
                            'Channel username: ',
                            ['a', {id: 'freedom_channel_username'}]
                        ],
                        ['span', {id: 'freedom_channel_username_none'}, '(none)']
                    ]
                ]
            ]);

            // table with fixed header
            this.daily_stats_popup = jsonToDOM(['div', {
                    id: 'daily_stat_popup',
                    class: 'freedom_hid freedom_popup'
                },
                ['div', {class: 'freedom_popup_header'},
                    ['span', {class: 'freedom_popup_header_title'},
                        util.locale('daily_video_statistics')
                    ],
                    ['span', {class: 'freedom_popup_header_close fa fa-times'}]
                ],
                ['div', {class: 'freedom_popup_content'},
                    ['span', {class: 'freedom_loading'},
                        util.locale('loading')
                    ],
                    ['div', {class: 'freedom_daily_stat_table_wrapper'},
                        ['div', {class: 'freedom_daily_stat_table_container'},
                            ['table',
                                ['thead',
                                    ['tr',
                                        ['th', {
                                                rowspan: 2,
                                                style: 'vertical-align: middle; width: 20%'
                                            },
                                            util.locale('date'),
                                            ['div', {class: 'col_fixed_date'},
                                                util.locale('date')
                                            ]
                                        ],
                                        ['th', {
                                                colspan: 2,
                                                style: 'vertical-align: middle; width: 30%'
                                            },
                                            util.locale('views'),
                                            ['div', {class: 'col_fixed_views'},
                                                util.locale('subscribers')
                                            ]
                                        ],
                                        ['th', {
                                                colspan: 2,
                                                style: 'vertical-align: middle; width: 30%'
                                            },
                                            util.locale('views'),
                                            ['div', {class: 'col_fixed_views'},
                                                util.locale('views')
                                            ]
                                        ],
                                        ['th', {
                                                rowspan: 2,
                                                style: 'vertical-align: middle; width: 20%'
                                            },
                                            util.locale('videos'),
                                            ['div', {class: 'col_fixed_video'},
                                                util.locale('videos')
                                            ]
                                        ]
                                    ],
                                    ['tr', {class: 'sub_header'},
                                        ['th',
                                            util.locale('change'),
                                            ['div', {class: 'col_fixed_change'},
                                                util.locale('change')
                                            ]
                                        ],
                                        ['th',
                                            util.locale('total'),
                                            ['div', {class: 'col_fixed_change'},
                                                util.locale('total')
                                            ]
                                        ],
                                        ['th',
                                            util.locale('change'),
                                            ['div', {class: 'col_fixed_change'},
                                                util.locale('change')
                                            ]
                                        ],
                                        ['th',
                                            util.locale('total'),
                                            ['div', {class: 'col_fixed_change'},
                                                util.locale('total')
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    ['div', {class: 'freedom_daily_stat_chart_wrapper'},
                        ['div', {class: 'freedom_chart_title'},
                            util.locale('daily_video_views_statistics')
                        ],
                        ['canvas', {
                                id: 'freedom_daily_views_chart',
                                width: '390',
                                height: '190'
                            }
                        ],
                        ['div', {class: 'freedom_chart_title'},
                            util.locale('daily_video_subscribers_statistics')
                        ],
                        ['canvas', {
                                id: 'freedom_daily_subs_chart',
                                width: '390',
                                height: '190'
                            }
                        ]
                    ]
                ]
            ]);


            this.add_event_handlers();
        },

        start: function () {
            var channel_username_none,
                channel_username,
                channel_id;

            if (!~['watch', 'channel'].indexOf(data.page) || !data.channel_id || settings.stats_collection) {
                return;
            }

            this.id_changed = this.prev_id !== data.channel_id;

            if (!this.id_changed && this.integrity()) {
                return;
            }

            if (!this.line || (this.id_changed && this.prev_id !== null)) {
                this.initialize();
            }


            channel_username_none = util.$('#freedom_channel_username_none', this.line);
            channel_username = util.$('#freedom_channel_username', this.line);
            channel_id = util.$('#freedom_channel_id', this.line);

            this.prev_id = data.channel_id;
            this.line.className = data.page;
            this.line.setAttribute('data-channel-id', data.channel_id);

            this.render();

            channel_id.textContent = data.channel_id;
            channel_id.setAttribute('href', 'https://www.youtube.com/channel/' + data.channel_id);

            if (data.username.length === 24 && data.username.indexOf('UC') === 0) {
                channel_username_none.style.display = 'inline';
                channel_username.style.display = 'none';
            }
            else {
                channel_username.textContent = data.username;
                channel_username.setAttribute('href', 'https://www.youtube.com/user/' + data.username);
                channel_username.style.display = 'inline';
                channel_username_none.style.display = 'none';
            }

            util.$('#freedom_channel_id_span', this.line)
                .style.display = ~location.href.indexOf('/channel/') ? 'none' : 'inline';

            util.$('#freedom_channel_username_span', this.line)
                .style.display = ~location.href.indexOf('/user/') ? 'none' : 'inline';

            if (this.id_changed) {
                util.api('vpd_spd')
                    ({channel_id: data.channel_id})
                    .get(this.set_vpd_spd);
            }
        },

        set_vpd_spd: function (err, result) {
            var vpm,
                spm,
                vph,
                sph,
                indexed;

            indexed = result && (result.vpd > 0 || result.spd > 0);

            if (result && !isNaN(result.vpd) && indexed) {
                vpm = result.vpd * 30;
                vph = ~~(result.vpd / 24);

                if (vpm >= 1000) {
                    vpm = numeral(vpm).format('0a');
                }

                util.$('#freedom_vpm', this.line)
                    .replace(jsonToDOM(['span',
                        ['b', vpm],
                        ' ' + util.locale('vpm')
                    ]));

                util.$('#freedom_vpd', this.line)
                    .replace(jsonToDOM(['span',
                        ['b', util.number_with_commas(result.vpd)],
                        ' ' + util.locale('vpd')
                    ]));

                util.$('#freedom_vph', this.line)
                    .replace(jsonToDOM(['span',
                        ['b', util.number_with_commas(vph)],
                        ' ' + util.locale('vph')
                    ]));
            }

            if (result && !isNaN(result.spd) && indexed) {
                spm = result.spd * 30;
                sph = ~~(result.spd / 24);

                util.$('#freedom_spm', this.line)
                    .replace(jsonToDOM(['span',
                        ['b', util.number_with_commas(spm)],
                        ' ' + util.locale('spm')
                    ]));

                util.$('#freedom_spd', this.line)
                    .replace(jsonToDOM(['span',
                        ['b', util.number_with_commas(result.spd)],
                        ' ' + util.locale('spd')
                    ]));

                util.$('#freedom_sph', this.line)
                    .replace(jsonToDOM(['span',
                        ['b', util.number_with_commas(sph)],
                        ' ' + util.locale('sph')
                    ]));
            }

            if (!indexed) {
                util.$('#freedom_vpm', this.line)
                    .replace(jsonToDOM(['span',
                        ['b', util.locale('less_valuable')]
                    ]));
            }

            if (result && !isNaN(result.videos)) {
                util.$('#freedom_videos', this.line)
                    .replace(jsonToDOM(
                        ['span', {title: util.locale('public_video')},
                            ['b', util.number_with_commas(result.videos) + ' '],
                            util.locale('videos')
                    ]));
            }
        },

        remove: function () {
            var elem = util.$(this.container);
            if (elem) {
                elem.parentElement.removeChild(elem);
                this.daily_stats_popup.remove();
            }
        },

        exists: function () {
            return !!util.$(this.container);
        },

        render: function () {
            var e;

            if (this.id_changed) {
                this.remove();
            }

            if (data.page === 'channel') {
                e = util.$('#c4-primary-header-contents');
            }
            else if (data.page === 'watch') {
                e = util.$('.yt-user-info')[0];
            }

            if (e) {
                e.appendChild(this.line);
                util.$('#content').appendChild(this.daily_stats_popup);
            }
        },

        integrity: function () {
            var elem = util.$(this.container);
            return elem && elem.getAttribute('data-channel-id') === data.channel_id;
        },

        add_event_handlers: function () {
            var that = this;

            util.$('#freedom_vpd, #freedom_vpm, #freedom_spd, #freedom_spm', this.line).forEach(function (elem) {
                elem.addEventListener('click', that.load_daily_stats);
            });

            this.daily_stats_popup.addEventListener('click', function (evt) {
                evt.stopPropagation();
            });

            util.$('.freedom_popup_header_close', this.daily_stats_popup)[0].addEventListener('click',
                this.close_daily_stats_popup);
        },

        load_daily_stats: function (evt) {
            var that = this,
                popup = util.$('#daily_stat_popup');

            evt.stopPropagation();
            this.open_daily_stats_popup();

            if (this.daily_stats) {
                popup.remove_class('loading');
                return;
            }

            popup.add_class('loading');
            util.api('channel_daily_views')
                ({channel_id: data.channel_id})
                .get(function (err, result) {
                    popup.remove_class('loading');
                    if (err) {
                        console.log(err);
                        return;
                    }

                    that.daily_stats = result;
                    that.render_daily_stat_table();
                    that.daily_stats.reverse();
                    that.render_daily_stat_chart();
                });
        },

        render_daily_stat_table: function () {
            var that = this,
                view_change,
                subscribe_change,
                tbody = util.$('tbody', this.daily_stats_popup);

            // render table
            if (tbody && tbody.length) {
                tbody[0].remove();
            }

            tbody = ['tbody'];
            this.daily_stats.forEach(function (item, index) {
                if (index < that.daily_stats.length - 1) {
                    view_change = item.views - that.daily_stats[index + 1].views;
                    subscribe_change = item.subscribers - that.daily_stats[index + 1].subscribers;

                    tbody.push(['tr',
                        ['td', item.insert_date],
                        ['td', {
                                class: 'freedom_td_number' + (subscribe_change >= 0 ? ' positive' :
                                    ' negative')
                            },
                            ['span', {class: 'freedom_td_sign'},
                                subscribe_change > 0 ? '+' : (subscribe_change < 0 ? '-' : '')
                            ],
                            ['span', subscribe_change.toLocaleString()]
                        ],
                        ['td', {class: 'freedom_td_number'}, item.subscribers.toLocaleString()],
                        ['td', {
                                class: 'freedom_td_number' + (view_change >= 0 ? ' positive' :
                                    ' negative')
                            },
                            ['span', {class: 'freedom_td_sign'},
                                view_change > 0 ? '+' : (view_change < 0 ? '-' : '')
                            ],
                            ['span', view_change.toLocaleString()]
                        ],
                        ['td', {class: 'freedom_td_number'}, item.views.toLocaleString()],
                        ['td', {class: 'freedom_td_number'}, item.videos.toLocaleString()]
                    ]);
                }
            });

            util.$('table', this.daily_stats_popup)[0].appendChild(jsonToDOM(tbody));
        },

        render_daily_stat_chart: function () {
            var view_ctx = util.$('#freedom_daily_views_chart').getContext('2d'),
                view_data = this.get_chart_data_set('views'),
                subscribe_ctx = util.$('#freedom_daily_subs_chart').getContext('2d'),
                subscribe_data = this.get_chart_data_set('subscribers'),
                chart_option = {
                    datasetStrokeWidth: 1,
                    pointDot: false,
                    bezierCurve: false
                };

            new Chart(view_ctx).Line({
                labels: view_data.labels,
                datasets: [{
                    label: util.locale('daily_video_views_statistics'),
                    fillColor: 'rgba(220,220,220,0.2)',
                    strokeColor: 'rgba(230,33,23,1)',
                    data: view_data.data
                }]
            }, chart_option);

            new Chart(subscribe_ctx).Line({
                labels: subscribe_data.labels,
                datasets: [{
                    label: util.locale('daily_video_views_statistics'),
                    fillColor: 'rgba(220,220,220,0.2)',
                    strokeColor: 'rgba(230,33,23,1)',
                    data: subscribe_data.data
                }]
            }, chart_option);
        },

        get_chart_data_set: function(name){
            var that = this,
                chart_data = [],
                labels = [];

            this.daily_stats.forEach(function (item, index) {
                var change = index > 0 ? item[name] - that.daily_stats[index - 1][name] : 0;

                // skip zero for better smoothen chart
                if (change) {
                    labels.push(item.insert_date);
                    chart_data.push(change);
                }
            });

            labels.forEach(function (label, index) {
                if (index % 5 !== 0) {
                    labels[index] = '';
                }
            });

            return {
                labels: labels,
                data: chart_data
            };
        },

        close_daily_stats_popup: function () {
            var popup = util.$('#daily_stat_popup');
            popup.add_class('freedom_hid');
            document.removeEventListener('click', this.close_daily_stats_popup);
        },

        open_daily_stats_popup: function () {
            var that = this,
                popup = util.$('#daily_stat_popup');

            _(util.$('.freedom_popup'))
                .forEach(function (pop) {
                    pop.add_class('freedom_hid');
                    //*pop.style.display = 'none';
                })
                .commit();

            popup.remove_class('freedom_hid');
            popup.style.left = (document.documentElement.clientWidth -
                popup.clientWidth) / 2 + 'px';
            popup.style.top = (document.documentElement.clientHeight -
                popup.clientHeight) / 2 + 'px';

            document.addEventListener('click', that.close_daily_stats_popup);
        },

        settings_changed: function (change) {
            if (change.channel_identifier) {
                util.$('#freedom_channel_identifier')
                    .style.display = settings.channel_identifier ? 'inline' : 'none';
            }
        }
    };

    widgets.push(widget);

})();

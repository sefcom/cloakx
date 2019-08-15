(function () {
    'use strict';

    var widget = {
        name: 'Latest channel statistics',

        container_selector: '#latest_channel_stats',
        report_data: null,

        initialize: function () {
            var login_url = util.get_login_link(location.href);

            this.widget_dom = jsonToDOM(['div', {
                    id: 'latest_channel_stats',
                    class: 'yt-card'
                },
                ['h2', {class: 'branded-page-module-title'}, util.locale('last_24_hours')],
                ['ul',
                    ['li', {id: 'freedom_latest_login'},
                        ['a', {href: login_url}, util.locale('last_24_hours_login_link')]
                    ],
                    ['li', {class: 'latest_channel_stats_item'},
                        ['span', {class: 'latest_channel_stats_item_label'}, util.locale('views')],
                        ['span', {
                            id: 'freedom_latest_views',
                            class: 'latest_channel_stats_item_value'
                        }]
                    ],
                    ['li', {class: 'latest_channel_stats_item'},
                        ['span', {class: 'latest_channel_stats_item_label'}, util.locale('likes')],
                        ['span', {
                            id: 'freedom_latest_likes',
                            class: 'latest_channel_stats_item_value'
                        }]
                    ],
                    ['li', {class: 'latest_channel_stats_item'},
                        ['span', {class: 'latest_channel_stats_item_label'}, util.locale('dislikes')],
                        ['span', {
                            id: 'freedom_latest_dislikes',
                            class: 'latest_channel_stats_item_value'
                        }]
                    ],
                    ['li', {class: 'latest_channel_stats_item'},
                        ['span', {class: 'latest_channel_stats_item_label'}, util.locale('comments')],
                        ['span', {
                            id: 'freedom_latest_comments',
                            class: 'latest_channel_stats_item_value'
                        }]
                    ],
                    ['li', {class: 'latest_channel_stats_item'},
                        ['span', {class: 'latest_channel_stats_item_label'}, util.locale('watched_in_minutes_abbr')],
                        ['span', {
                            id: 'freedom_latest_watched',
                            class: 'latest_channel_stats_item_value'
                        }]
                    ]
                ]
            ]);
        },

        start: function () {
            if (settings.channel_latest_stats) {
                this.build_channel_report();
            }
        },

        remove: function () {
            this.widget_dom.remove();
        },

        build_channel_report: function () {
            if (!session.user) {
                return this.render();
            }

            this.get_channel_report_data();
        },

        get_channel_report_data: function () {
            var that = this;

            if (data.own_channel_id) {
                util.api('channel_latest_stats')({
                        channel_id: data.own_channel_id
                    })
                    .get({'ACCESS-TOKEN': session.access_token}, null, function (err, result) {
                        if (err) return;

                        that.report_data = result;
                        that.render();
                    });
            }
        },

        render: function () {
            var side_bar = util.$('#other-channels-sidebar-container'),
                own_channel = data.own_channel_id === data.channel_id;

            this.remove();

            if (!side_bar || !own_channel) {
                return;
            }

            side_bar.appendChild(this.widget_dom);

            // don't have access, show login link
            if (session.user) {
                util.$(this.container_selector).add_class('freedom_logged_in');
            }
            else {
                util.$(this.container_selector).remove_class('freedom_logged_in');
            }

            if (this.report_data) {
                this.set_stats('freedom_latest_views', this.report_data.views);
                this.set_stats('freedom_latest_likes', this.report_data.likes);
                this.set_stats('freedom_latest_dislikes', this.report_data.dislikes);
                this.set_stats('freedom_latest_comments', this.report_data.comments);
                this.set_stats('freedom_latest_watched', this.report_data.estimatedMinutesWatched);
            }
        },

        set_stats: function (id, value) {
            var lbl = util.$('#' + id, this.widget_dom);

            if (value) {
                lbl.textContent = this.get_metric_display(value);
            }

            lbl.parentElement.style.display = value ? 'block' : 'none';
        },

        settings_changed: function (change) {
            if (!change.channel_latest_stats) {
                return;
            }

            if (!settings.channel_latest_stats) {
                this.remove();
            }
        },

        get_metric_display: function (metric) {
            return metric && numeral(metric).format('0a');
        }
    };

    widgets.push(widget);
})();

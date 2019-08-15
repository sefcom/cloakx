(function () {
    'use strict';

    var widget = {

        name: 'Heartbeat YouTube Channel Activity for Creator Studio',
        container: '#hb_yt_channel_activity_for_creator_studio',
        activities: '',
        channel_id: '',
        creator_sidebar: '',

        initialize: function () {
            var trigger_pages_submenu = [
                // '/dashboard',
                // '/my_videos',
                // '/view_all_playlists',
                // '/live_dashboard',
                // '/my_live_events',
                '/comments',
                '/messages',
                '/subscribers',
                '/timedtext_cs_panel',
                '/comment_management',
                '/credits',
                // '/features',
                // '/upload_defaults',
                // '/featured_content',
                // '/branding',
                // '/advanced_settings',
                // '/analytics',
                // '/audiolibrary/music'
            ];

            if (~trigger_pages_submenu.indexOf(window.location.pathname)) {

                widget.hb_logo = jsonToDOM(
                    ['img', {
                        id: 'hb_logo_community',
                        class: 'element-animation',
                        src: config.assets_url + 'logo.png'
                    }]
                );

                widget.activities_dropdown = jsonToDOM(
                    ['li', {class: 'creator-sidebar-item'},
                        ['a', {
                                class: 'creator-sidebar-item-link yt-uix-sessionlink',
                                onclick: widget.load_activities,
                                href: '#activities',
                            },
                            ['img', {
                                id: 'hb_logo_activities',
                                src: config.assets_url + 'logo.png'
                            }],
                            ['span', {class: 'creator-sidebar-item-content'},
                                util.locale('yta_activities')
                            ]
                        ]
                    ]
                );

                widget.activities_div = jsonToDOM(
                    ['div', {class: 'activities_div activities_div_hidden'},
                        ['div', {class: 'activities_header'},
                            ['h2',
                                ['b', util.locale('yta_recent')]
                            ]
                        ],
                        ['div', {class: 'activities_body'}],
                        ['div', {class: 'activities_load_more'},
                            ['button', {
                                class: 'load_more_activities yt-uix-button yt-uix-button-size-default yt-uix-button-dark',
                                onclick: widget.load_more_activities
                            }, util.locale('yta_load_more')]
                        ]
                    ]
                );

                // disable the hb logo
                // widget.attach_hb_logo();
                widget.render();
            }
        },

        attach_hb_logo: function () {
            util.$wait('#creator-sidebar-section-id-community', function (err, result) {
                var res;

                if (err) {
                    return;
                }

                res = result.children[0].children[0].children[1];
                res.className += (' adjust');
                res.appendChild(widget.hb_logo);
            });
        },

        render: function () {
            if (!settings.channel_activity) return;

            util.wait_for(function () {
                var channel_id = util.retrieve_window_variables({
                        channel_id: 'yt.config_.GOOGLE_HELP_PRODUCT_DATA.channel_external_id'
                    }).channel_id;

                if (channel_id) {
                    widget.channel_id = channel_id;
                    return true;
                }
            }, function (err) {
                var submenu = util.$('.creator-sidebar-submenu')[1],
                    selected = util.$('.creator-sidebar-item.selected')[0];

                if (err || !submenu) return;

                submenu.insertBefore(widget.activities_dropdown, submenu.childNodes[4]);

                if (window.location.hash === '#activities') {
                    util.bind_elem_functions(widget.activities_dropdown).add_class('selected');
                    selected && selected.remove_class('selected');
                    widget.load_activities();
                }
            });
        },

        stop: function () {
            if (!settings.channel_activity && widget.activities_dropdown) {
                widget.activities_dropdown.remove();
            }
        },

        load_activities: function () {
            util.api('get_activity')({channel_id: widget.channel_id})
                .get(function (err, result) {
                    if (err) return;

                    widget.activities = result;
                    widget.show_activities();
                });
        },

        show_activities: function () {
            var cpc = util.$('#creator-page-content'),
                container;

            _(util.$('.creator-sidebar-submenu')[1].children)
                .forEach(function (a, key) {
                    if (a.classList.contains('selected')) {
                        a.className = 'creator-sidebar-item';
                    }
                })
                .commit();

            util.bind_elem_functions(widget.activities_dropdown).add_class('selected');
            util.log_count_per_day('activities');
            cpc.children[0].remove();
            cpc.appendChild(widget.activities_div);
            container = util.$('.activities_body')[0];

            _(widget.activities.items)
                .forEach(function (a, key) {
                    var elem = jsonToDOM(activity_builder.build_activity(a));

                    if (elem) container.appendChild(elem);
                })
                .commit();

            if (container.children.length >= widget.activities.pageInfo.totalResults) {
                util.$('.load_more_activities')[0].style.display = 'none';
            }

            widget.activities_div.className = 'activities_div activities_div_shown';
        },

        load_more_activities: function () {
            var lmb = util.$('.load_more_activities')[0],
                ab = util.$('.activities_body')[0];

            lmb.innerText = util.locale('yta_loading');
            lmb.disabled = true;

            util.api('get_activity')({
                    channel_id: widget.activities.channel_id,
                    next_page_token: widget.activities.nextPageToken
                })
                .get(function (err, result) {
                    if (err) {
                        return;
                    }

                    widget.activities = result;

                    _(widget.activities.items)
                        .forEach(function (a, key) {
                            var elem = jsonToDOM(activity_builder.build_activity(a));

                            if (elem) ab.appendChild(elem);
                        })
                        .commit();

                    if (ab.children.length >= widget.activities.pageInfo.totalResults) {
                        lmb.style.display = 'none';
                    }

                    lmb.innerText = util.locale('yta_load_more');
                    lmb.disabled = false;
                });
        },

        settings_changed: function (changed) {
            if (changed.channel_activity) {
                if (settings.channel_activity && widget.show) {
                    widget.render();
                }
                else {
                    widget.stop();
                }
            }
        }
    };

    widgets.push(widget);
})();

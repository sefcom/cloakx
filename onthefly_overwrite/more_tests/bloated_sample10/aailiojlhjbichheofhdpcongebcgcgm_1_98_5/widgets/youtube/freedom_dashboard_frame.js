'use strict';
/*global settings, util, jsonToDOM, widgets, data, fermata, config*/

/*
    @@name Commenter-Relationship Manager
*/

(function () {

    var widget = {

        name: 'Freedom! Dashboard Frame',

        initialize: function () {
            this.freedom_frame = jsonToDOM(
                ['iframe', {
                    id: 'freedom-dashboard-frame',
                    src: 'https://www.freedom.tm/'
                }]
            );

            this.sidebar_menu = jsonToDOM(
                ['li', {
                        id: 'creator-sidebar-freedom-dashboard',
                        style: settings.freedom_dashboard ? '' : 'display: none',
                        class: 'creator-sidebar-section creator-sidebar-single-section'
                    },
                    ['h3',
                        ['a', {
                                id: 'freedom-dashboard-link',
                                href: '#freedom-dashboard',
                                class: 'creator-sidebar-section-link yt-uix-sessionlink'
                            },
                            ['span', {class: 'studio-icon creator-sidebar-dashboard yt-sprite freedom-icon'}],
                            ['span', {class: 'header-text network-name'},
                                'Freedom! Dashboard'
                            ]
                        ]
                    ]
                ]
            );
        },

        start: function () {
            var pages = [
                    'dashboard', 'my_videos', 'my_live_events', 'view_all_playlists',
                    'my_videos_copyright', 'comment_hub', 'messages', 'subscribers',
                    'timedtext_cs_panel', 'comment_management', 'credit_hub', 'features',
                    'upload_defaults', 'featured_content', 'branding', 'advanced_settings',
                    'analytics', 'audiolibrary'
                ];

            if (~pages.indexOf(data.page)) {
                util.$wait('.yt-uix-button-dark', function (err, elems) {
                    if (err) return;

                    util.api('network_details')({channel_id: elems[0].getAttribute('onclick').split('"')[3]})
                        .get(function (err, result) {
                            if (err) return;

                            if (result.length) {
                                widget.render(result[0]);
                            }
                            else {
                                widget.render();
                            }

                            util.$wait('.creator-sidebar-feedback', function (err, result) {
                                if (err) return;

                                util.bind_elem_functions(result[0].children[0]).add_class('padding-hr');
                                result[0].appendChild(jsonToDOM(
                                    ['button', {
                                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-dark mar-pad-hr',
                                            type: 'button',
                                            onclick: 'window.open("http://www.support.tm/", "_blank");'
                                        },
                                        ['span', {class: 'yt-uix-button-content'}, util.locale('support')]
                                    ]
                                ));
                            });
                        });
                });
            }
        },

        render: function (result) {
            var logo = this.sidebar_menu.children[0].children[0].children[0],
                list = util.$('#creator-sidebar'),
                backgroundUrl = result ? result.logo : 'https://www.freedom.tm/images/flogo-120.png';

            if (result) {
                util.$wait('.network-name', function (err, elems) {
                    if (err) return;

                    elems[0].innerText = result.name;
                });
            }

            this.sidebar_menu.addEventListener('click', this.bind_listener);

            logo.style.background = 'no-repeat url(' + backgroundUrl + ')';
            logo.style.backgroundSize = 'contain';
            list.insertBefore(this.sidebar_menu, list.childNodes[5]);

            if (window.location.href.split('#')[1] === 'freedom-dashboard') {
                this.sidebar_menu.click();
            }
        },

        bind_listener: function () {
            function remover () {
                if (util.$('#freedom-dashboard-frame')) {
                    util.$('#creator-page-content').removeChild(util.$('#freedom-dashboard-frame'));
                }
            }

            _(util.$('.selected'))
                .forEach(function (e) {
                    e.classList.remove('selected');
                })
                .commit();

            if (data.page === 'credit_hub') {
                this.freedom_frame.style.left = '0';
                this.freedom_frame.style.width = '100%';
            }
            else if (data.page === 'analytics') {
                this.freedom_frame.style.left = '234px';

                _(util.$('.creator-sidebar-item-link'))
                    .forEach(function (e) {
                        e.addEventListener('click', remover);
                    })
                    .commit();
            }

            util.$('#creator-sidebar-freedom-dashboard').classList.add('selected');
            util.$('.freedom-icon')[0].classList.add('selected');
            util.$('#creator-page-content').appendChild(this.freedom_frame);
            util.log_count_per_day('dashboard_option');
        },

        settings_changed: function (change) {
            if (change.freedom_dashboard) {
                util.$('#creator-sidebar-freedom-dashboard').style.display = settings.freedom_dashboard ? '' : 'none';
                util.$('#freedom-dashboard-frame').style.display = settings.freedom_dashboard ? '' : 'none';
            }
        }
    };

    widgets.push(widget);

})();

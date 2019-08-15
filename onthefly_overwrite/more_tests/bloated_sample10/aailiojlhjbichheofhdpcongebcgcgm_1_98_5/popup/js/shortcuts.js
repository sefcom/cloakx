(function () {
    'use strict';

    var setting_page = {
        start: function () {
            this.content_page = jsonToDOM(['div', {
                    id: 'shortcut_footer_content',
                },
                ['div', {
                        class: 'footer-box',
                        id: 'platform_shortcut'
                    },
                    ['a', {
                            id: 'freedom_dark_mode',
                            style: !settings.light_switch ? '' : 'display:none'
                        },
                        ['i', { class: 'fa fa-lightbulb-o' }],
                        ['span', util.light_switch_text()]
                    ],
                    ['a', {
                            id: 'freedom_video_manager',
                            style: settings.hide_video_manager ? '' : 'display:none',
                            onclick: function (evt) {
                                window.open('https://www.youtube.com/my_videos');
                            }
                        },
                        ['i', { class: 'fa fa-file-video-o' }],
                        ['span', util.locale('video_manager')]
                    ],
                    ['a', {
                            id: 'freedom_analytics',
                            style: settings.hide_analytics ? '' : 'display:none',
                            onclick: function (evt) {
                                window.open('https://www.youtube.com/analytics' +
                                    (settings.realtime_analytics ? '#r=realtime' : '')
                                );
                            }
                        },
                        ['i', { class: 'fa fa-line-chart' }],
                        ['span', util.analytics_text()]
                    ],
                    ['a', {
                            id: 'freedom_all_comments',
                            style: settings.hide_comments ? '' : 'display:none',
                            onclick: function () {
                                window.open('https://www.youtube.com/comments');
                            }
                        },
                        ['i', { class: 'fa fa-users' }],
                        ['span', util.comments_text()]
                    ]
                ],
                ['div', { class: 'footer-box' },
                    ['a', {href: 'https://www.youtube.com/playlist?list=PLxLYo5_7D3SdNDe8YF0lsiXoyUkvA5Z5K', target: '_blank'},
                        ['i', { class: 'fa fa-eye' }],
                        ['span', util.locale('get_more_views')]
                    ],
                    ['a', {href: 'https://www.youtube.com/editor', target: '_blank'},
                        ['i', { class: 'fa fa-file-video-o' }],
                        ['span', util.locale('free_video_editor')]
                    ],
                    ['a', {href: 'https://creatoracademy.withgoogle.com/page/education', target: '_blank'},
                        ['i', { class: 'fa fa-graduation-cap' }],
                        ['span', util.locale('youtube_academy')]
                    ]
                ],
                ['div', { class: 'footer-box' },
                    ['a', {href: 'https://www.heartbeat.tm/crm', target: '_blank'},
                        ['i', { class: 'fa fa-comments' }],
                        ['span', util.locale('crm_toggle')]
                    ],
                    ['a', {href: 'https://twitter.com/heartbeattm', target: '_blank'},
                        ['i', { class: 'fa fa-twitter' }],
                        ['span', util.locale('heartbeat_twitter')]
                    ]
                ],
                ['div', { class: 'footer-box' },
                    ['a', {href: 'https://www.heartbeat.tm/feedback.html', target: '_blank'},
                        ['i', { class: 'fa fa-comments-o' }],
                        ['span', util.locale('feedback')]
                    ],
                    ['a', {href: 'https://docs.google.com/document/d/1UdzCAwEsi3Ibtc57ftI_jcO7X_pDgWFaikiy4eV6tcQ/edit?usp=sharing', target: '_blank'},
                        ['i', { class: 'fa fa-user-secret' }],
                        ['span', util.locale('privacy_policy')]
                    ]

                ]
            ]);

            util.$('#heartbeat_footer').appendChild(this.content_page);
            heartbeat_menu_popup.on_platform_shortcut_change();
        }
    };

    heartbeat_menu_popup.add_page(setting_page);
})();

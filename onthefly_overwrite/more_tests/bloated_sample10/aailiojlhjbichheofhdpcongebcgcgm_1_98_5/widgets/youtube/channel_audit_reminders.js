/*
    Channel audit reminders
*/

(function () {
    'use strict';

    var widget = {

        name: 'Channel audit reminders',

        list_link: {
            advanced: 'https://www.youtube.com/advanced_settings',
            about: 'https://www.youtube.com/channel/',
            upload_default: 'https://www.youtube.com/upload_defaults',
            comment: 'https://www.youtube.com/comment_management',
            channel_tips: 'https://www.youtube.com/notifications'
        },

        number_of_tips: 0,

        initialize: function () {

            this.channel_tips_box = jsonToDOM(['div', {
                    class: 'branded-page-box yt-card',
                    id: 'heartbeat-channel-audit'
                },
                ['h2', {class: 'branded-page-module-title'}, util.locale('heartbeat_tips')],
                ['ul', {id: 'heartbeat-channel-list-tip'}],
                ['div', {class: 'view-all-link'},
                    ['a', {id: 'heartbeat-channel-list-tip-view-all'}, util.locale('view_all')]
                ]
            ]);


            this.channel_tips_popup = jsonToDOM(['div', {
                    class: 'freedom_hid freedom_popup',
                    id: 'popup'
                },
                ['div', {class: 'freedom_popup_header'},
                    ['span', {class: 'freedom_popup_header_title'}, util.locale('channel_missing_features')],
                    ['span', {class: 'freedom_popup_header_close fa fa-times'}]
                ],
                ['div', {class: 'freedom_popup_content'},
                    ['div', {class: 'column-popup'},
                        ['h3', util.locale('heartbeat_tips')],
                        ['ul', {id: 'list_missing_features'}]
                    ],
                    ['div', {class: 'column-popup'},
                        ['h3', util.locale('youtube_tips')],
                        ['ul', {id: 'list_missing_features_default'}]
                    ]
                ]
            ]);

        },

        start: function () {
            if (data.channel_id && data.channel_id === data.own_channel_id) {
                this.list_link.about += data.own_channel_id.toString() + '/about';
                this.render();
            }
        },

        render: function () {
            var mast = util.$('.branded-page-v2-secondary-col') && util.$('.branded-page-v2-secondary-col')[0];

            if (mast) {
                mast.insertBefore(this.channel_tips_box, mast.firstElementChild);
                util.$('#content').appendChild(this.channel_tips_popup);
                util.$('#heartbeat-channel-list-tip-view-all').addEventListener('click', this.open_channel_tips_popup);
                this.get_channel_tips_data();
                this.add_default_channel_tips();
                this.number_of_tips = 0;
            }

        },

        integrity: function () {
            return  util.$('.branded-page-v2-secondary-col') && util.$('.branded-page-v2-secondary-col')[0];
        },

        open_channel_tips_popup: function (evt) {
            var that = this,
                popup = util.$('#popup');

            popup.remove_class('freedom_hid');
            popup.style.left = (document.documentElement.clientWidth -
                popup.clientWidth) / 2 + 'px';
            popup.style.top = (document.documentElement.clientHeight -
                popup.clientHeight) / 2 + 'px';
            document.addEventListener('click', that.close_channel_tips_popup);
            evt.stopPropagation();
        },

        close_channel_tips_popup: function () {
            var popup = util.$('#popup');

            popup.add_class('freedom_hid');
            document.removeEventListener('click', this.close_channel_tips_popup);
        },

        get_channel_tips_data: function () {
            util.api('channel_tips')
                ({id: data.channel_id})
                .get(this.parse_data);
        },

        parse_data: function (err, result) {
            if (err) {
                return;
            }

            if (result) {
                this.check_missing(result);
            }
        },

        check_missing: function (results) {
            var temp;

            results = results.brandingSettings.channel;

            if (!results.keywords) {
                this.add_tips(util.locale('missing_keywords'), this.list_link.advanced);
            }

            if (!results.moderateComments || !results.moderateComments) {
                this.add_tips(util.locale('missing_comunity_settings'), this.list_link.comment);
            }

            if (!results.trackingAnalyticsAccountId) {
                this.add_tips(util.locale('missing_tracking_analytics'), this.list_link.advanced);
            }

            if (!results.description) {
                this.add_tips(util.locale('missing_descriptions'), this.list_link.about);
            }

            if (this.number_of_tips === 0) {
                temp = util.$('.branded-page-v2-secondary-col')[0];
                if (temp) {
                    temp.removeChild(this.channel_tips_box);
                }
            }
            else {
                this.add_tips(util.locale('missing_upload_defaults'), this.list_link.upload_default);
            }

        },

        child_of_box: function (tipstring, link) {
            return jsonToDOM(['li', {class: 'checklist-item active yt-uix-hovercard'},
                ['div',
                    ['span', {class: 'todo-icon yt-sprite'}],
                    ['a', {href: link},
                        ['p', tipstring]
                    ]
                ]
            ]);
        },

        child_of_popup: function (tipstring, link) {
            return jsonToDOM(['li',
                ['a', {href: link},
                    ['p', tipstring]
                ]
            ]);
        },

        child_of_popup_default: function (tipstring, link) {
            return jsonToDOM(['li',
                ['div',
                    ['a', {
                            class: 'todo-title-text',
                            href: link
                        },
                        tipstring
                    ]
                ]
            ]);
        },

        add_tips: function (tipstring, link) {
            var tips_box = util.$('#heartbeat-channel-list-tip'),
                tips_popup = util.$('#list_missing_features');

            if (!tips_box) {
                return;
            }

            this.number_of_tips += 1;

            if (this.number_of_tips <= 3) {
                tips_box.appendChild(this.child_of_box(tipstring, link));
            }

            tips_popup.appendChild(this.child_of_popup(tipstring, link));
        },

        add_default_channel_tips: function () {
            var list = util.$('.c4-checklist-module ul li'),
                tips_popup = util.$('#list_missing_features_default'),
                h4_text = '',
                class_name = '';

            for (var i = 0; i < list.length; i++) {
                h4_text = list[i].getElementsByClassName('todo-title-text')[0].innerHTML;
                class_name = list[i].getAttribute('class');
                if (!~class_name.indexOf('done')) {
                    tips_popup.appendChild(this.child_of_popup_default(h4_text, this.list_link.channel_tips));
                }
            }
        }
    };

    widgets.push(widget);
})();

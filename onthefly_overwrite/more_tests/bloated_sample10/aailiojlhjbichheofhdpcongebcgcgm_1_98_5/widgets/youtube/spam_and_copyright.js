/*
    Spam and copyright suspsects
*/

(function () {
    'use strict';

    var widget = {

        name: 'Spam and copyright suspects',

        initialize: function () {
            this.new_link = jsonToDOM(
                ['li', {class: 'creator-sidebar-item'},
                    ['a', {class: 'creator-sidebar-item-link yt-uix-sessionlink'},
                        ['span', {
                                class: 'creator-sidebar-item-content',
                                onclick: this.push_history
                            },
                            'Suspects'
                        ]
                    ]
                ]
            );
        },

        start: function () {
            if (location.pathname === '/my_suspects') {
                location.href = location.origin + location.pathname.replace('suspects', 'channels')
                    + '?o=' + util.parse_qs().o + '&suspects=1';
                return;
            }

            if (location.pathname !== '/my_channels' && location.pathname !== '/my_channels_invited') {
                return;
            }

            this.check_role();
        },

        check_role: function () {
            var temp;

            if (!session.has_role('verifier')) {
                return;
            }

            data.google_account_email = session.user.emails.verifier;

            this.session_token = util.$('input[name="session_token"]')[0].value;

            temp = util.$('#creator-sidebar-section-id-my-channels .creator-sidebar-submenu')[0];
            temp.appendChild(this.new_link);

            if (util.parse_qs().suspects) {
                this.push_history();
            }
        },

        push_history: function (e) {
            var temp;

            if (e) {
                e.preventDefault();
            }

            util.$('.creator-sidebar-item.selected')[0].classList.remove('selected');
            this.new_link.classList.add('selected');
            history.pushState({}, 'Suspects - YouTube', 'my_suspects' + location.search);

            // clean
            util.$('.mc-actions')[0].replace(['div']);

            temp = util.$('.creator-subheader-controls')[0];
            if (temp) {
                util.$('.creator-subheader-controls')[0].replace(['div']);
            }

            util.$('#mc-channel-list-ol').replace(['div']);
            util.$('.mc-channel-footer')[0].replace(['div']);

            // set header name
            util.$('#creator-subheader-text').textContent = 'Suspects';

            util.api('suspects')({network_id: util.parse_qs().o})
                .get({'ACCESS-TOKEN': session.access_token}, null, this.insert_suspects);

            return false;
        },

        insert_suspects: function (err, result) {
            var list;

            if (err) {
                return console.log(err);
            }

            list = util.$('#mc-channel-list-ol');

            result.forEach(function (a) {
                list.append_child(
                    ['li', {
                            id: 'mc-channel-' + a.channel_id.slice(2),
                            class: 'mc-channel-item edit-button-enabled',
                        },
                        ['div', {class: 'mc-channel-item-content'},
                            ['div', {class: 'mc-channel-item-cell mc-channel-thumb'},
                                ['a', {
                                        href: '/channel/' + a.channel_id,
                                        target: '_blank',
                                        class: 'ux-thumb-wrap'
                                    },
                                    ['span', {class: 'video-thumb  yt-thumb yt-thumb-64 g-hovercard'},
                                        ['span', {class: 'yt-thumb-square'},
                                            ['span', {class: 'yt-thumb-clip'},
                                                ['img', {
                                                        src: 'http://0',
                                                        width: '64',
                                                        height: '64'
                                                }],
                                                ['span', {class: 'vertical-align'}]
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            ['div', {class: 'mc-channel-item-cell mc-channel-info-container'},
                                ['div', {class: 'mc-channel-title'},
                                    ['span', {
                                            class: 'mc-channel-title-container',
                                            id: 'checkbox_zkactWOCBpbS5zmnP16gsA'
                                        },
                                        ['a', {
                                                href: '/channel/' + a.channel_id,
                                                target: '_blank',
                                                class: 'mc-channel-title-content'
                                            },
                                            a.channel_id
                                        ]
                                    ]
                                ],
                                ['div', 'Note: ' + (a.notes || '')],
                                ['div', 'Question:' + (a.question || '')],
                                ['div', a.latest_verifier],
                                ['div', moment(a.insert_date, 'YYYY-MM-DD HH:mm:ss').fromNow()],
                                ['div',
                                    ['button', {
                                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default',
                                            'data-channel-id': a.channel_id,
                                            onclick: widget.save_channel
                                        },
                                        'Save'
                                    ],
                                    ['button', {
                                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-dark',
                                            'data-invite-id': a.invite_id,
                                            'data-channel-id': a.channel_id,
                                            'data-is-partnered': +a.is_partnered,
                                            onclick: widget.remove_channel
                                        },
                                        +a.is_partnered ? 'Unlink' : 'Revoke invitation'
                                    ]
                                ]
                            ]
                        ]
                    ]
                );
            });
        },

        save_channel: function (e) {
            var button = e.target;
            button.setAttribute('disabled', 'disabled');
            button.nextSibling.setAttribute('disabled', 'disabled');
            this.put_verdict(button.getAttribute('data-channel-id'), false);
        },

        remove_channel: function (e) {
            var button = e.target,
                is_partnered = +button.getAttribute('data-is-partnered'),
                channel = button.getAttribute('data-channel-id'),
                xhr = new XMLHttpRequest(),
                _data = 'si=0&so=tcld&session_token=' + this.session_token + '&o=' + util.parse_qs().o,
                action;

            button.setAttribute('disabled', 'disabled');
            button.previousSibling.setAttribute('disabled', 'disabled');

            if (is_partnered) {
                _data += '&channels=' + channel.substring(2) + '&sq=' + channel;
                action = 'action_remove';
            }
            else {
                _data += '&invited=1&invites=' + button.getAttribute('data-invite-id');
                action = 'action_invite_revoke';
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    console.log('done');
                }
            };

            xhr.open('POST', 'https://www.youtube.com/my_channels_ajax?' + action + '=1', false);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(_data);

            this.put_verdict(channel, true);
        },

        put_verdict: function (channel_id, verdict) {
            util.api('put_verdict')
                .put(
                    {'ACCESS-TOKEN': session.access_token},
                    {
                        channel_id: channel_id,
                        verdict: +verdict
                    },
                    this.alert_success
                );
        },

        alert_success: function (err, result) {
            console.log(result);
        }
    };

    widgets.push(widget);

})();

(function () {

'use strict';

    var widget = {

        name: 'Twitch Loyal Users',
        container: '#twitch_loyal_users',
        watchers: '',
        wc: 1,
        location: false,

        initialize: function () {
            // if loading don't do anything wait for another 3 sec
            if (!this.is_user_page()) {
                // nothing to do here
                return;
            }

            this.location = window.location.href;

            // get username in url (www.twitch.com/username?some_queries=value)
            var username = location.href.split('/').slice(-1)[0].split('?')[0];

            util.api('get_watchers')({username: username})
                .get(this.get_chatters);
        },

        integrity: function () {
            return this.location === window.location.href;
        },

        is_user_page: function () {
            // if og:video meta exist it's users page
            return util.$('#channel');
        },

        get_chatters: function (err, result) {
            if (err) {
                return;
            }

            widget.watchers = result;
            widget.confirm_chat_container();
        },

        confirm_chat_container: function () {
            var chatter = util.$('.chat-lines')[0];

            if (chatter && chatter.children.length) {
                return widget.get_first_chatter();
            }

            setTimeout(widget.confirm_chat_container, 1000);
        },

        detect_staff: function (arr, chatter, container) {
            if (arr.length) {
                _(arr)
                    .forEach(function (a, key) {
                        widget[chatter + '_' + key] = jsonToDOM(['div',
                            ['a', {href: 'http://www.twitch.tv/' + a}, a]
                        ]);

                        container.appendChild(widget[chatter + '_' + key]);
                    })
                .commit();
            }
            else {
                widget['no_' + chatter] = jsonToDOM(['p', 'N/A']);
                container.appendChild(widget['no_' + chatter]);
            }
        },

        get_first_chatter: function () {
            var holder = util.$('#stats-container'),
                chat_stats = util.$('#twitch_chat_stats');

            widget.chat_stats = jsonToDOM(['div', {
                id: 'twitch_chat_stats',
                class: 'active_panel'
            }]);

            if (holder && !chat_stats) {
                holder.appendChild(widget.chat_stats);
            }

            if (util.$('.chat-lines')[0].children[widget.wc] && chat_stats) {
                chat_stats.replace(
                    jsonToDOM(
                        ['table',
                            ['thead',
                                ['tr',
                                    ['td', util.locale('tc_admins')],
                                    ['td', util.locale('tc_mods')],
                                    ['td', util.locale('tc_gmods')],
                                    ['td', util.locale('tc_staff')],
                                    ['td', util.locale('tc_topchatters')]
                                ]
                            ],
                            ['tbody',
                                ['tr',
                                    ['td', ['br'], ['div', {id: 'twitch_chat_admins'}]],
                                    ['td', ['br'], ['div', {id: 'twitch_chat_moderators'}]],
                                    ['td', ['br'], ['div', {id: 'twitch_chat_global_moderators'}]],
                                    ['td', ['br'], ['div', {id: 'twitch_chat_staff'}]],
                                    ['td', ['br'],
                                        ['div', {id: 'twitch_chat_viewers'},
                                            ['div', {id: 'twitch_top_viewer_0'}],
                                            ['div', {id: 'twitch_top_viewer_1'}],
                                            ['div', {id: 'twitch_top_viewer_2'}],
                                            ['div', {id: 'twitch_top_viewer_3'}],
                                            ['div', {id: 'twitch_top_viewer_4'}],
                                            ['div', {id: 'twitch_top_viewer_5'}],
                                            ['div', {id: 'twitch_top_viewer_6'}],
                                            ['div', {id: 'twitch_top_viewer_7'}],
                                            ['div', {id: 'twitch_top_viewer_8'}],
                                            ['div', {id: 'twitch_top_viewer_9'}]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    )
                );

                widget.detect_staff(widget.watchers.chatters.admins, 'admin', util.$('#twitch_chat_admins'));
                widget.detect_staff(widget.watchers.chatters.moderators, 'moderators', util.$('#twitch_chat_moderators'));
                widget.detect_staff(widget.watchers.chatters.global_mods, 'global_moderators', util.$('#twitch_chat_global_moderators'));
                widget.detect_staff(widget.watchers.chatters.staff, 'staff', util.$('#twitch_chat_staff'));

                widget.process_chatters();
            }
            else {
                if (chat_stats) {
                    chat_stats.replace(
                        jsonToDOM(['div', {class: 'lol_description'},
                                ['span', util.locale('chat_stats_error')]
                            ])
                    );
                }

                setTimeout(widget.get_first_chatter, 1000);
            }
        },

        process_chatters: function () {
            var new_chatters = [],
                temp = [],
                cn,
                observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.addedNodes[0]) {
                            if (mutation.addedNodes[0].nodeName !== '#text') {
                                cn = mutation.addedNodes[0].children[0].children[3].innerHTML;
                            }
                        }

                        if (cn) {
                            if (!~temp.indexOf(cn)) {
                                temp.push(cn);

                                new_chatters.push({
                                    name: cn,
                                    count: 1
                                });
                            }
                            else {
                                new_chatters[temp.indexOf(cn)].count++;
                            }
                        }

                        new_chatters.sort(function (a, b) {
                            return b.count - a.count;
                        });

                        _.times(10, function (i) {
                            var parent = util.$('#twitch_top_viewer_' + i);

                            while (parent.hasChildNodes()) {
                                parent.removeChild(parent.firstChild);
                            }

                            if (new_chatters[i]) {
                                widget['viewer_' + i] = jsonToDOM(
                                    ['a', {href: 'http://www.twitch.tv/' + new_chatters[i].name},
                                    new_chatters[i].name + ': ' + numeral(new_chatters[i].count).format('0,0')
                                ]);

                                parent.appendChild(widget['viewer_' + i]);
                            }
                        });
                    });
                });

            observer.observe(util.$('.chat-lines')[0], {childList: true});
        }

    };

    widgets.push(widget);
})();


(function() {
    
    'use strict';

    var widget = {

        name: 'Notify streamers online',

        initialize: function () {
            if (!settings.hb_streamer_notify || util.in_iframe()) {
                return;
            }

            this.wrapper = jsonToDOM(['div', {id: 'heartbeat_msg_wrap'}]);

            chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
                if (request.message !== 'streamer_online') {
                    return;
                }

                widget.show_message(request.subscription);
            });
        },

        start: function () {
            var body = util.$('body')[0];

            if (!body || !settings.hb_streamer_notify || util.in_iframe() || util.$('#heartbeat_msg_wrap')) {
                return;
            }

            body.appendChild(this.wrapper);
        },

        show_message: function (subscription) {
            var span, dom,
                first_child = this.wrapper.firstChild;

            span = util.locale('user_is_playing_game_on_platform')
                .replace('{user}', '')
                .replace('{platform}', '')
                .replace('{game}', subscription.playing_game || '');
            dom = util.bind_elem_functions(jsonToDOM(['div', {class: 'heartbeat_msg_item'},
                ['div', {class: 'heartbeat_header'}, 
                    ['span', 'Heartbeat'],
                    ['i', {
                        class: 'fa fa-times',
                        onclick: function () {
                            dom.remove();
                        }
                    }]
                ],
                ['div', {class: 'heartbeat_body'},
                    ['div', {class: 'heartbeat_profile_image'},
                        ['img', {src: subscription.profile_image}]
                    ],
                    ['div', {class: 'heartbeat_content'},
                        ['a', {href: subscription.url}, subscription.display_name],
                        ['span', span],
                        ['a', {href: subscription.url}, subscription.platform]
                    ]
                ]
            ]));

            if (first_child) {
                this.wrapper.insertBefore(dom, first_child);
            }
            else {
                this.wrapper.appendChild(dom);
            }

            setTimeout(function () {
                dom.add_class('show');
                setTimeout(function () {
                    dom.remove_class('show');
                    setTimeout(function () {
                        dom.remove();
                    }, 2000);
                }, 6000);
            }, first_child ? 1000 : 500);
            return 
        }
    };

    widgets.push(widget);

})();

(function() {

    'use strict';

    var widget = {

        name: 'Invite Unpartnered Channel',

        start: function () {
            if (data.page === 'features') {
                widget.check_channel();
            }
        },

        check_channel: function () {
            util.$wait('.account-status-v2-user-info-network', function (err, eles) {
                var account_section_ele = eles[0];
                if (account_section_ele.children.length === 0) {

                    account_section_ele.appendChild(jsonToDOM(
                        ['ul', {class: 'account-status-v2-user-info-network-name'},
                            ['li', util.locale('network')],
                            ['li', ['strong', util.locale('none')]],
                            ['li',
                                ['a', {
                                        class: 'yt-uix-button yt-uix-button-default unpartnered_channel_btn',
                                        href: 'https://www.freedom.tm/via/Heartbeat',
                                        target: '_blank',
                                        onclick: _.partial(util.log_count_per_day, 'freedom_application', null)
                                    },
                                    ['span', util.locale('partner_with')],
                                    ['img', {class: 'unpartnered_channel_invite_logo'}]
                                ]
                            ]
                        ]
                    ));
                }
            })
        }
    }

    widgets.push(widget);

})();


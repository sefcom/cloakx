(function () {
    'use strict';

    var widget = {

        name: 'Channel Account Settings',

        initialize: function () {
            if (util.in_iframe() && window.top.location.hash === '#account_settings') {
                util.$('body')[0].add_class('yt_in_iframe');
            }

            this.widget_dom = jsonToDOM(['li', {class: 'creator-sidebar-item'},
                ['a', {
                        onclick: this.show_content,
                        class: 'creator-sidebar-item-link yt-uix-sessionlink',
                        id: 'freedom_channel_account_settings'
                    },
                    ['img', {
                        id: 'hb_logo_activities',
                        src: 'https://s3.amazonaws.com/heartbeat.asset/logo.png'
                    }],
                    ['span', {class: 'creator-sidebar-item-content'}, util.locale('account_settings')]
                ]
            ]);

            this.iframe_dom = jsonToDOM(['div', {id: 'freedom_channel_account_settings_content'},
                ['iframe', {class: 'freedom_custom_scrollbar'}]
            ]);
        },

        start: function () {
            if (!this.is_in_creator_page()) {
                this.remove();
                return;
            }

            this.render();
        },

        remove: function () {
            var iframe = util.$('#freedom_channel_account_settings_content');

            if (iframe) {
                iframe.remove();
            }
        },

        render: function (result) {
            var ul = util.$('#creator-sidebar-section-id-channel .creator-sidebar-submenu')[0];

            if (!ul || util.$('#freedom_channel_account_settings')) {
                return;
            }

            ul.appendChild(this.widget_dom);
            if (window.location.hash === '#account_settings') {
                this.show_content();
            }
        },

        is_in_creator_page: function () {
            return util.$('#creator-sidebar') &&
                util.$('#creator-sidebar-section-id-channel') &&
                util.$('#creator-sidebar-section-id-channel').has_class('selected');
        },

        integrity: function () {
            return this.is_in_creator_page() && util.$('#freedom_channel_account_settings');
        },

        show_content: function () {
            var content = util.$('#creator-page-content'),
                li = util.bind_elem_functions(this.widget_dom),
                iframe = util.$('iframe', this.iframe_dom)[0],
                ul = util.$('#creator-sidebar-section-id-channel .creator-sidebar-submenu')[0];

            if (!content || !iframe || !ul) {
                return;
            }

            util.log_count_per_day('account_settings');

            if (util.$('.selected', ul).length) {
                util.$('.selected', ul)[0].remove_class('selected');
            }

            li.add_class('selected');
            content.replace(this.iframe_dom);
            iframe.src = '/account';
            window.location.hash = '#account_settings';
        }
    };

    widgets.push(widget);
})();

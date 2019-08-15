(function () {
    'use strict';

    var widget = {
        name: 'Feed tab',

        tab_container_selector: '#freedom_feed_tab',
        nav_container_selector: '#freedom_feed_nav',
        channel_tab_container_selector: '#channel-navigation-menu',
        channel_nav_container_selector: '#appbar-nav .appbar-nav-menu',

        initialize: function () {
            this.tab_dom = this.create_item('freedom_feed_tab');
            this.tab_selected_dom = this.create_selected_item('freedom_feed_tab');
            this.nav_dom = this.create_item('freedom_feed_nav');
            this.nav_selected_dom = this.create_selected_item('freedom_feed_nav');
        },

        start: function () {
            if (data.page === 'channel' && settings.feed_tab) {
                this.render();
            }
        },

        remove: function () {
            util.$('li.freedom_feed').forEach(function (elem) {
                elem.parentElement.removeChild(elem);
            });
        },

        render: function () {
            var tab_container = util.$(this.channel_tab_container_selector),
                tabs = tab_container ? tab_container.children : null,
                discussion_tab = tabs ? tabs[Math.min(5, tabs.length)] : null,
                nav_container = util.$(this.channel_nav_container_selector)[0],
                nav_items = nav_container ? nav_container.children : null,
                discussion_nav_item = nav_items ? nav_items[Math.min(5, nav_items.length)] : null,
                is_selected = location.pathname.split('/').slice(-1)[0] === 'feed';

            if (util.$('li.freedom_feed').length) {
                return;
            }

            // remove some class that not make sense when open feed tab e.g. partially-selected
            if (is_selected) {
                util.$('.partially-selected').forEach(
                    function (a) {
                        a.remove_class('partially-selected');
                    });

                util.$('.epic-nav-item-heading').forEach(
                    function (a) {
                        a.add_class('un_selected');
                    });
            }

            if (tab_container && discussion_tab && discussion_tab.parentElement) {
                tab_container.insertBefore(!is_selected ? this.tab_dom : this.tab_selected_dom,
                    discussion_tab);
            }

            if (nav_container && discussion_nav_item && discussion_nav_item.parentElement) {
                nav_container.insertBefore(!is_selected ? this.nav_dom : this.nav_selected_dom,
                    discussion_nav_item);
            }

            this.set_feed_link();
        },

        settings_changed: function (change) {
            if (change.feed_tab && !settings.feed_tab) {
                this.remove();
            }
        },

        integrity: function () {
            return util.$(this.tab_container_selector) && util.$(this.nav_container_selector);
        },

        set_feed_link: function () {
            var first_a = util.$(this.channel_tab_container_selector + ' li a')[0],
                url = first_a ? first_a.getAttribute('href') : '',
                segments = url.split('/'),
                feed_url = '';

            segments.splice(segments.length - 1, 1, 'feed');
            feed_url = segments.join('/');
            util.$('li.freedom_feed a').forEach(function (elem) {
                elem.setAttribute('href', feed_url);
            });
        },

        create_item: function (id) {
            return jsonToDOM(
                ['li', {
                        id: id,
                        class: 'freedom_feed'
                    },
                    ['a', {
                            href: '/',
                            class: 'yt-uix-button spf-link yt-uix-sessionlink '
                                 + 'yt-uix-button-epic-nav-item yt-uix-button-size-default'
                        },
                        ['span', {'class': 'yt-uix-button-content'}, util.locale('feed')]
                    ]
                ]
            );
        },

        create_selected_item: function (id) {
            return jsonToDOM(
                ['li', {
                        id: id,
                        class: 'freedom_feed'
                    },
                    ['h2', {class: 'epic-nav-item-heading '}, util.locale('feed')]
            ]);
        }
    };

    widgets.push(widget);
})();

(function () {
    'use strict';

    var widget = {
        name: 'Dailymotion Earnings',
        container: '#dailymotion_earnings',

        initialize: function () {
            if (this.is_game_page()) {
                this.dailymotion_earnings = jsonToDOM(['p', {id: 'dailymotion_earnings'}]);
                return;
            }

            this.dailymotion_earnings = jsonToDOM(['div', {
                    id: 'dailymotion_earnings',
                    class: 'foreground font-lg mrg-btm-sm align-end'
                }
            ]);
        },

        start: function () {
            var that = this;

            if (!settings.dailymotion_earnings) {
                this.remove();
                return;
            }

            if (this.is_game_page()) {
                this.start_game_page();
                return;
            }

            this.start_main_page();
        },

        settings_changed: function (change) {
            if (change.dailymotion_earnings && !settings.dailymotion_earnings) {
                this.remove();
            }
        },

        integrity: function () {
            return util.$('#dailymotion_earnings');
        },

        start_main_page: function () {
            var that = this;

            util.$wait('#video_views_count', function (err, elem) {
                if (err) return;

                that.render(util.$('.views_and_share')[0], elem.innerText, 'first');
            }, 200, 10000);
        },

        start_game_page: function () {
            var that = this;

            util.$wait('.count-viewers-views', function (err, elem) {
                if (err) return;

                elem = util.$('.count-viewers__audience', elem[0]);

                if (!elem.length) return;

                that.render(util.$('.count-viewers-views')[0], elem[0].innerText, 'last');
            }, 200, 10000);
        },

        render: function (container, text, position) {
            var views = text.replace(/[a-z, ,\,,A-Z]/ig, '');

            util.bind_elem_functions(this.dailymotion_earnings).replace(jsonToDOM(['span',
                ['span', numeral((+views * 7 * 0.55 * 0.25) / 1000).format('$0,0.00')],
                ['span', {class: 'estimated_abbr'}, util.locale('estimated_abbr')]
            ]));

            if (!container) return;

            if (position === 'last') {
                container.appendChild(this.dailymotion_earnings);
            }
            else if (position === 'first') {
                container.insertBefore(this.dailymotion_earnings, container.firstChild);
            }
        },

        remove: function () {
            this.dailymotion_earnings.remove();
        },

        is_game_page: function () {
            return ~location.hostname.indexOf('games.dailymotion.com');
        }
    };

    widgets.push(widget);
})();


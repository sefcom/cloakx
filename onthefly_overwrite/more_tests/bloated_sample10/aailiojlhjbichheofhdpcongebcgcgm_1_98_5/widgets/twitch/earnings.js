/*
    @@name Stats line widget
    @@contains
        estimated earnings of a twitch account
        - view earnings
    to do:
        - subscriber earningsa
*/

(function () {
    'use strict';

    var widget = {

        name: 'Twitch Earnings',
        container: '#twitch_earnings',

        initialize: function () {

            this.twitch_earnings = jsonToDOM(
                ['span', {
                        id: 'twitch_earnings',
                        style: settings.twitch_earnings ? '' : 'display:none',
                        title: 'Estimated lifetime earnings',
                        class: 'stat'
                    },
                    ['span', {class: 'twitch_earnings_icon'}, '$ ']
            ]);   
        },

        start: function () {

            var e, earnings, self = this,

                i = setInterval(function () {
                    e = util.$('.ember-view.stat')[0];
                    if (e) {
                        clearInterval(i);
                        earnings = numeral((+e.innerText.replace(/,/g, '') * 7 * 0.55 * 0.25) / 1000)
                            .format('0,0.00') + ' est.';
                        self.twitch_earnings.appendChild(document.createTextNode(earnings));
                        self.render();
                    }
                }, 100);
        },

        settings_changed: function (change) {
            if (change.twitch_earnings) {
                this.twitch_earnings.style.display = settings.twitch_earnings ? 'inline-block' : 'none';
            }
        },

        render: function () {
            var e;

            e = util.$('.channel-stats')[0];
            if (e) {

                if (!util.$('#twitch_earnings')) {
                    e.appendChild(this.twitch_earnings);  
                }
            }
        },

    };

    widgets.push(widget);

})();

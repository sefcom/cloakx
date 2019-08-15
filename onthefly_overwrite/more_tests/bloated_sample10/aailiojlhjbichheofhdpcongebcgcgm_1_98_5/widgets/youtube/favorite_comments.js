/*
    @@name Favorites comments widget
*/

(function () {
    'use strict';

    var widget = {

        name: 'Favorite comments',

        container: '#freedom_comments',

        initialize: function () {

            this.show = this.should_show_widget();
            if (!this.show) {
                return;
            }

            this.first = true;

            this.whole_widget = jsonToDOM(
                ['div', {
                        id: this.container.slice(1),
                        'data-vid-id': util.parse_qs().v
                    },
                    ['a', {
                            id: 'freedom_pick_alternate',
                            class: 'freedom_small_btn',
                            target: '_blank',
                            href: 'https://www.heartbeat.tm/winner/?videoId=' +
                                util.parse_qs().v,
                            style: settings.pick_a_winner && settings.heartbeat_labs ? '' : 'display:none'
                        },
                        (util.locale('pick_a_winner'))]
                ]
            );
        },

        start: function () {
            var self = this,
                interval;

            this.show = this.should_show_widget();

            if (!this.show) {
                return;
            }

            interval = setInterval(function () {
                var e = util.$('#comment-section-renderer');
                if (e && e.children.length) {
                    clearInterval(interval);
                    setTimeout(self.render, 1500);
                }
            }, 100);

        },

        should_show_widget: function () {
            return location.pathname === '/watch';
        },

        remove: function () {
            var elem = util.$(this.container);
            if (elem) {
                elem.parentElement.removeChild(elem);
            }
        },

        render: function () {
            var e = util.$('.comment-section-header-renderer')[0];

            this.remove();

            if (e) {
                e.appendChild(this.whole_widget);
            }
        },

        integrity: function () {
            var elem = util.$(this.container);
            return elem && elem.getAttribute('data-vid-id') === data.video_id;
        },

        settings_changed: function (change) {

            if (change.heartbeat_labs || (change.pick_a_winner && this.whole_widget)) {
                util.$('#freedom_pick_alternate', this.whole_widget)
                    .style.display = settings.pick_a_winner && settings.heartbeat_labs ? '' : 'none';
            }

        }
    };

    widgets.push(widget);

})();

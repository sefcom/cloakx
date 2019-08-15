/*
    @@name Broadcaster stats (e.g. schedule tracker)
*/

(function () {
    'use strict';

    var widget = {

        name: 'Broadcaster Stats',

        initialize: function () {
            this.stats_button = jsonToDOM(
                ['li', {},
                    ['a', {
                            id: 'stats_button',
                            style: settings.broadcaster_stats ? '' : 'display:none',
                            'title': 'View broadcaster\'s stats',
                            class: 'ember-view'
                        }, 'View Stats'
                    ],
                ]
            );

            this.stats_div = jsonToDOM(
                ['section', {
                        id: 'stats_div',
                        class: 'ember-view ac-container'
                    },
                    ['p', util.locale('broadcaster_stats'),
                        ['img', {src: 'https://s3.amazonaws.com/heartbeat.asset/hb-logo-purple.png'}],
                        ['br'],
                        ['br']
                    ]
                ]
            );

            this.template = jsonToDOM(
                ['div', {class: 'ember-view stat-sched'},
                    ['input', {type: 'checkbox'}],
                    ['label'],
                    ['article', {class: 'ac-medium'},
                        ['ul', {class: 'chartlist'}]
                    ]
                ]
            );

            this.chart = jsonToDOM(
                ['li', {class: 'chartime'},
                    ['span', ['a']]
                ]
            );
        },

        start: function () {
            var url = window.location.href.split('/');

            if (url[4] === 'profile') {
                fermata
                    .json('https://api.twitch.tv/kraken/channels/'
                        + url[3] + '/videos?limit=15&broadcasts=true')
                    .get(this.process_stats);

                this.listen_events();
            }
        },

        process_stats: function (err, result) {
            var count = 0,
                stats = {},
                url = window.location.href.split('/'),
                temp,
                i;

            if (err) {
                return;
            }

            _(result.videos).reverse()
                .forEach(function (e) {
                    var obj = {},
                        date = e.recorded_at.split('T')[0],
                        org = moment(e.recorded_at).format('LLLL'),
                        fdate = moment(date).format('MMM D - ddd'),
                        time = moment(org).format('h:mm a'),
                        end;

                    if (+new Date(e.recorded_at) < +new Date(moment().subtract(6, 'days'))) {
                        return;
                    }

                    if (!stats[date]) {
                        stats[date] = {};
                        count++;
                    }

                    if (!stats[date].data) {
                        stats[date].data = [];
                    }

                    obj.title = e.title;
                    obj.url = e.url;

                    obj.start = time;
                    obj.start_raw = +moment(org).format('HH');
                    obj.duration = ~~((e.length / 60) / 60);

                    end = new Date(org);
                    end.setMinutes(end.getMinutes() + (obj.duration * 60));
                    obj.end = moment(end).format('h:mm a');
                    obj.end_raw = +moment(end).format('HH');

                    stats[date].date = fdate;
                    stats[date].data.push(obj);

                    stats[date].total_duration = ~~(stats[date].total_duration
                        ? stats[date].total_duration + obj.duration
                        : obj.duration);
                }).commit();

            this.stats = _.values(stats);

            temp = _.keys(stats)[0];
            if (count < 6) {
                for (i = 1; i <= 6 - count; i++) {
                    temp = moment(temp).subtract(1, 'days').format('YYYY-MM-DD');

                    stats[temp] = {};
                    stats[temp].data = [];
                    stats[temp].date = moment(temp).format('MMM D - ddd');
                    stats[temp].total_duration = 0;

                    this.stats.unshift(stats[temp]);
                }
            }

            if (url[5] && url[5] === 'past_broadcasts') {
                this.show_stats();
            }
        },

        show_stats: function () {
            var self = this,
                e = util.$('#stats_div'),
                k = util.$('.profile-content')[0],
                node = this.stats_div.cloneNode(true);

            if (e) {
                e.style.display = '' ;
                return;
            }

            setTimeout(function () {
                k.children[1].children[0].style.top = '15px';
                k.children[1].insertBefore(node, k.children[1].children[0]);

                self.insert_stats();
            }, 500);
        },

        listen_events: function () {
            var self = this,
                i,

                hide_stats = function () {
                    var e = util.$('#stats_div');

                    if (e) {
                        e.style.display = 'none';
                    }
                };

            i = setInterval(function () {
                var menu = util.$('ul.nav li');

                if (menu.length) {
                    clearInterval(i);

                    _(menu)
                        .forEach(function (l, _i) {
                            if (_i === 1) {
                                return l.addEventListener('click', self.show_stats);
                            }

                            l.addEventListener('click', hide_stats);
                        })
                        .commit();
                }
            });
        },

        insert_stats: function () {
            var self = this,
                e = util.$('#stats_div'),
                node = this.template.cloneNode(true),
                k,
                o;

            node.setAttribute('id', 'time-label');
            node.children[0].setAttribute('checked', 'checked');
            node.children[1].textContent = 'Time';

            for (k = 0; k < 24; k++) {
                o = self.chart.cloneNode(true);

                o.children[0].textContent = moment(k, 'HH').format('h:mm a');
                node.children[2].children[0].appendChild(o);
            }

            e.appendChild(node);

            _(this.stats)
                .forEach(function () {
                    var h,
                        nod;

                    node = self.template.cloneNode(true);

                    node.children[0].setAttribute('id', k);
                    node.children[0].setAttribute('checked', 'checked');
                    node.children[1].textContent = o.date;

                    for (k = 0; k < 24; k++) {
                        h = +moment(k, 'HH').format('HH');
                        nod = self.chart.cloneNode(true);

                        _(o.data)
                            .forEach(function (l) {
                                if (!l.duration) {
                                    return;
                                }

                                if (h >= l.start_raw && h <= l.end_raw) {
                                    nod.children[0].children[0].textContent = l.title;
                                    nod.children[0].children[0].setAttribute('class', 'index');
                                    nod.children[0].children[0].setAttribute('href', l.url);
                                    nod.children[0].children[0].setAttribute('target', '_blank');

                                    if (h === l.start_raw) {
                                        nod.children[0].children[0].setAttribute('class', 'index vtitle');
                                    }

                                    nod.setAttribute('class', 'chartime colored');
                                    nod.setAttribute('title', l.title + ' (' + l.start
                                        + ' - ' + l.end + ')');

                                    node.children[2].children[0].appendChild(nod);
                                }
                                else {
                                    nod.children[0].setAttribute('class', 'index');
                                    node.children[2].children[0].appendChild(nod);

                                    if (nod.children[0].children[0].textContent === '') {
                                        nod.children[0].children[0].textContent = 'none';
                                    }
                                }
                            })
                            .commit();
                    }

                    e.appendChild(node);
                })
                .commit();
        },

        settings_changed: function (change) {
            if (change.broadcaster_stats) {
                var e = util.$('#stats_button');

                e.style.display = settings.broadcaster_stats ? '' : 'none';

                e = util.$('stats_div');
                e.style.display = settings.broadcaster_stats ? '' : 'none';
            }
        },

    };

    widgets.push(widget);
})();

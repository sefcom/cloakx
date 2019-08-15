(function () {
    var widget = {
        name: 'trending videos link',

        initialize: function () {
            this.dom = jsonToDOM(
                ['li', {
                        class: 'guide-section',
                        id: 'trending-videos'
                    },
                    ['div', {class: 'guide-item-container personal-item'},
                        ['ul', {class: 'guide-user-links yt-uix-tdl yt-box'},
                            ['li', {class: 'guide-channel guide-notification-item overflowable-list-item'},
                                ['a', {
                                        class: 'guide-item yt-uix-sessionlink yt-valign spf-link',
                                        href: 'https://www.heartbeat.tm/analytics',
                                        target: '_blank'
                                    },
                                    ['span', {class: 'yt-valign-container'},
                                        ['span', {class: 'thumb yt-sprite trending-logo'},
                                            ['i', {class: 'fa fa-heart'}]
                                        ],
                                        ['span', {class: 'display-name no-count'},
                                            util.locale('heartbeat_trending')
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            );
        },

        start: function () {
            if (!util.$('#trending-videos')) {
                this.render();
            }
        },

        render: function () {
            var that = this;
            util.$wait('.guide-toplevel', function (error, element) {
                if (!error) {
                    element = element[0];
                    element.appendChild(that.dom);
                }
            });
        }
    };

    widgets.push(widget);
})();


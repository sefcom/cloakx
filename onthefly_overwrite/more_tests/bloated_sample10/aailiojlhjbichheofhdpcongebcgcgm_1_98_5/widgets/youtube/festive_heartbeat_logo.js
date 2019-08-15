(function () {
    'use strict';

    var widget = {
        name: 'Festive Heartbeat Logo',

        initialize: function () {
            widget.light_logo = jsonToDOM(
                ['a', {
                    id: 'festive_heartbeat_logo',
                    href: 'https://www.heartbeat.tm',
                    target: '_blank',
                    title: 'Heartbeat Home'
                },
                    ['img', {
                        src: '//s3.amazonaws.com/heartbeat.asset/images/youtube/festive_heartbeat_logo_new.png',
                        class: 'yt-sprite'
                    }]
                ]
            );

            widget.css = jsonToDOM(
                ['style',
                    '#yt-masthead .yt-masthead-logo-container {' +
                        'width: 270px; !important;' +
                    '}' +

                    '#festive_heartbeat_logo {' +
                        'display: inline-block;' +
                        'position: relative;' +
                        'margin-left: 20px;' +
                        'vertical-align: middle;' +
                    '}' +

                    '#festive_heartbeat_logo img {' +
                        'width: 35px;' +
                        'height: 30px;' +
                    '}'
                ]
            );
        },

        start: function () {
            // only available on December
            if ((new Date()).getMonth() !== 11) return ;

            // ready existed
            if (util.$('#festive_heartbeat_logo')) return;

            util.$wait('#yt-masthead', function (err, ele) {
                if (err || !ele) return;

                util.$('head')[0].appendChild(widget.css);
                util.$('.yt-masthead-logo-container', ele)[0].appendChild(widget.light_logo);
            });
        }
    };

    widgets.push(widget);
})();

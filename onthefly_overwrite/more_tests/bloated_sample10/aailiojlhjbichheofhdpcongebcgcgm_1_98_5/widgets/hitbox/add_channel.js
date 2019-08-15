(function () {
    'use strict';

    var widget = {

        name: 'Add channel',

        start: function () {
            this.check_channel();
        },

        check_channel: function () {
            var href = util.$('.highlight')[0].getElementsByTagName('a'),
                split,
                username,
                i;

            if (href.length) {
                href = href[0].getAttribute('href');
                split = href.split('/');
                username = split[2] || '';
            }

            i = setInterval(function () {
                var channel_id = (util.$('#meta-info'))
                               ? (util.$('#meta-info').getElementsByTagName('a')[0]).innerText.trim()
                               : '',
                    website = window.location.host;

                if (channel_id && username) {
                    clearInterval(i);
                    util.api('channel')
                        .post({
                                channel_id: channel_id,
                                username: username,
                                website: website,
                                email: ' '
                            },
                            function () {}
                        );
                }
            }, 200);
        }
    };

    widgets.push(widget);

})();

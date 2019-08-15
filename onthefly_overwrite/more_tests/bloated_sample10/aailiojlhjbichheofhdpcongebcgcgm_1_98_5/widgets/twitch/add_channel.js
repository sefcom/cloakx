(function () {
    'use strict';

    var widget = {

        name: 'Add channel',

        start: function () {
            this.check_channel();
        },

        check_channel: function () {
            var i = setInterval(function () {
                var channel_name = (util.$('.channel-name')[0])
                                 ? util.$('.channel-name')[0].innerText.trim()
                                 : null,
                    you = (util.$('#you>span'))
                        ? util.$('#you>span').innerText.trim()
                        : '',
                    website = window.location.host;

                if (channel_name && you) {
                    clearInterval(i);

                    util.api('channel')
                        .post({
                                channel_id: channel_name,
                                username: you,
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

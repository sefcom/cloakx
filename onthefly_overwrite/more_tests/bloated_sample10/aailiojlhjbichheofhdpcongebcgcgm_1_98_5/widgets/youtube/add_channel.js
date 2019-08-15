(function () {
    'use strict';

    var widget = {

        name: 'Add channel',

        check_channel: function () {
            data.website = window.location.host;

            if (data.channel_id && data.email) {
                util.api('channel')
                    .post({
                            channel_id: data.channel_id,
                            username: data.username,
                            website: data.website,
                            email: data.email
                        },
                        function () {}
                    );
            }
        },

        start: function () {
            if (data.page === 'channel') {
                this.check_channel();
            }
        }

    };

    widgets.push(widget);
})();
